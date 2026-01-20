import { openWindow } from './window';

interface DownloadOptions<T = string> {
  fileName?: string;
  source: T;
  target?: string;
}

const DEFAULT_FILENAME = 'downloaded_file';

/**
 * 通过 URL 下载文件，支持跨域
 * 
 * 使用场景：
 * - 下载服务器上的静态文件（PDF、文档、图片、压缩包等）
 * - 下载需要认证的文件（通过URL参数传递token）
 * - 下载跨域资源文件
 * 
 * 原理：
 * 1. Chrome/Safari浏览器：使用 <a> 标签的 download 属性直接触发下载
 *    - 优点：支持自定义文件名，下载体验好
 *    - 限制：受同源策略影响，跨域文件可能被阻止
 * 2. 其他浏览器：通过新窗口打开URL，依赖服务器响应头触发下载
 *    - 如果URL没有查询参数，自动添加 ?download 参数
 *    - 服务器需要设置 Content-Disposition 响应头来触发下载
 * 3. iOS设备检测：iOS Safari不支持程序化下载，直接返回
 * 
 * 注意事项：
 * - 跨域文件下载可能受CORS策略限制
 * - 某些浏览器可能弹出下载确认对话框
 * 
 * @throws {Error} - 当下载失败时抛出错误
 */
export async function downloadFileFromUrl({
  fileName,
  source,
  target = '_blank',
}: DownloadOptions): Promise<void> {
  if (!source || typeof source !== 'string') {
    throw new Error('Invalid URL.');
  }

  const isChrome = window.navigator.userAgent.toLowerCase().includes('chrome');
  const isSafari = window.navigator.userAgent.toLowerCase().includes('safari');

  if (/iP/.test(window.navigator.userAgent)) {
    console.error('Your browser does not support download!');
    return;
  }

  if (isChrome || isSafari) {
    triggerDownload(source, resolveFileName(source, fileName));
    return;
  }
  if (!source.includes('?')) {
    source += '?download';
  }

  openWindow(source, { target });
}

/**
 * 通过 Base64 下载文件
 * 
 * 使用场景：
 * - 下载已经在内存中的Base64编码数据（如图片、PDF等）
 * - 下载前端生成的Base64内容（如Canvas绘制的图片、生成的文档）
 * - 下载从API获取的Base64编码文件
 * 
 * 原理：
 * 1. Base64数据可以直接作为 data URL 使用（格式：data:[<mediatype>][;base64],<data>）
 * 2. 将Base64数据作为 href 传递给 <a> 标签的 download 属性
 * 3. 浏览器会自动将 data URL 转换为文件并下载
 * 
 * 优点：
 * - 无需网络请求，下载速度快
 * - 支持离线下载
 * - 不受CORS限制
 * 
 * 限制：
 * - Base64编码会增加约33%的数据大小
 * - 大文件可能导致内存占用过高
 * 
 * @throws {Error} - 当Base64数据无效时抛出错误
 */
export function downloadFileFromBase64({ fileName, source }: DownloadOptions) {
  if (!source || typeof source !== 'string') {
    throw new Error('Invalid Base64 data.');
  }

  const resolvedFileName = fileName || DEFAULT_FILENAME;
  triggerDownload(source, resolvedFileName);
}

/**
 * 通过图片 URL 下载图片文件
 * 
 * 使用场景：
 * - 下载网络上的图片文件（JPG、PNG、GIF、WebP等）
 * - 下载需要跨域的图片资源
 * - 下载用户上传到服务器的图片
 * 
 * 原理：
 * 1. 先将图片URL转换为Base64格式（通过Canvas绘制）
 * 2. 转换过程：
 *    - 创建 Image 对象并设置 crossOrigin 属性以支持跨域
 *    - 将图片绘制到 Canvas 上
 *    - 使用 canvas.toDataURL() 将图片转换为Base64
 * 3. 转换完成后，调用 downloadFileFromBase64 进行下载
 * 
 * 优点：
 * - 可以绕过某些跨域限制（通过Canvas转换）
 * - 支持图片格式转换（如将WebP转为PNG）
 * 
 * 限制：
 * - 受Canvas跨域策略限制，需要服务器设置正确的CORS响应头
 * - 转换过程需要等待图片加载完成，大图片可能较慢
 * - 某些浏览器可能对Canvas跨域有更严格的限制
 * 
 * @throws {Error} - 当图片加载失败或Canvas创建失败时抛出错误
 */
export async function downloadFileFromImageUrl({
  fileName,
  source,
}: DownloadOptions) {
  const base64 = await urlToBase64(source);
  downloadFileFromBase64({ fileName, source: base64 });
}

/**
 * 通过 Blob 下载文件
 * 
 * 使用场景：
 * - 下载从API获取的二进制数据（如文件流、Excel、PDF等）
 * - 下载前端生成的Blob对象（如通过FileReader读取的文件）
 * - 下载通过 fetch/axios 获取的响应数据（response.blob()）
 * 
 * 原理：
 * 1. Blob（Binary Large Object）是浏览器提供的二进制数据对象
 * 2. 使用 URL.createObjectURL(blob) 创建临时对象URL
 *    - 这个URL指向内存中的Blob数据
 *    - 格式类似：blob:http://example.com/xxx-xxx-xxx
 * 3. 将临时URL传递给下载函数，触发下载
 * 4. 下载完成后，通过 URL.revokeObjectURL() 释放内存
 * 
 * 优点：
 * - 支持大文件下载（不会一次性加载到内存）
 * - 支持各种文件类型（通过Blob的type属性指定MIME类型）
 * - 内存管理更高效（使用对象URL而非Base64）
 * 
 * 注意事项：
 * - 必须及时调用 revokeObjectURL 释放内存
 * - Blob URL只在当前文档生命周期内有效
 * 
 * @throws {TypeError} - 当source不是Blob类型时抛出错误
 */
export function downloadFileFromBlob({
  fileName = DEFAULT_FILENAME,
  source,
}: DownloadOptions<Blob>): void {
  if (!(source instanceof Blob)) {
    throw new TypeError('Invalid Blob data.');
  }

  const url = URL.createObjectURL(source);
  triggerDownload(url, fileName);
}

/**
 * 下载文件，支持 Blob、字符串和其他 BlobPart 类型
 * 
 * 使用场景：
 * - 下载各种类型的数据（字符串、ArrayBuffer、TypedArray、DataView等）
 * - 统一处理不同数据格式的下载需求
 * - 下载前端生成的内容（如JSON字符串、CSV文本等）
 * 
 * 原理：
 * 1. BlobPart 是 Blob 构造函数的参数类型，包括：
 *    - Blob 对象
 *    - ArrayBuffer 和 ArrayBufferView（如Uint8Array）
 *    - 字符串（String）
 *    - 其他 Blob 对象
 * 2. 如果数据不是 Blob，则使用 new Blob([source]) 转换为 Blob
 *    - 默认MIME类型为 'application/octet-stream'（二进制流）
 *    - 可以根据需要指定其他类型（如 'text/plain'、'application/json'）
 * 3. 转换为 Blob 后，使用对象URL方式下载
 * 
 * 优点：
 * - 统一的下载接口，支持多种数据类型
 * - 自动处理类型转换，使用方便
 * - 适合下载文本类内容（如CSV、JSON、TXT等）
 * 
 * 示例：
 * - 下载JSON字符串：downloadFileFromBlobPart({ source: JSON.stringify(data), fileName: 'data.json' })
 * - 下载CSV文本：downloadFileFromBlobPart({ source: csvContent, fileName: 'export.csv' })
 */
export function downloadFileFromBlobPart({
  fileName = DEFAULT_FILENAME,
  source,
}: DownloadOptions<BlobPart>): void {
  // 如果 data 不是 Blob，则转换为 Blob
  const blob =
    source instanceof Blob
      ? source
      : new Blob([source], { type: 'application/octet-stream' });

  // 创建对象 URL 并触发下载
  const url = URL.createObjectURL(blob);
  triggerDownload(url, fileName);
}

/**
 * 将图片 URL 转换为 Base64 编码
 * 
 * 使用场景：
 * - 将网络图片转换为Base64用于下载或存储
 * - 图片预处理（压缩、格式转换）
 * - 将图片嵌入到HTML/CSS中（data URL）
 * - 图片上传前的格式转换
 * 
 * 原理：
 * 1. 创建 Image 对象并设置 crossOrigin 属性为空字符串
 *    - crossOrigin='' 等同于 crossOrigin='anonymous'，允许跨域请求
 *    - 需要服务器设置正确的CORS响应头（Access-Control-Allow-Origin）
 * 2. 监听图片加载完成事件（load）
 * 3. 创建 Canvas 元素，将图片绘制到Canvas上
 *    - 设置Canvas尺寸与图片尺寸一致
 *    - 使用 drawImage() 将图片绘制到Canvas
 * 4. 使用 canvas.toDataURL() 将Canvas内容转换为Base64
 *    - 默认格式为 'image/png'
 *    - 可以通过 mineType 参数指定其他格式（如 'image/jpeg'）
 * 5. 清理Canvas对象，释放内存
 * 
 * 优点：
 * - 可以转换图片格式（如WebP转PNG）
 * - 可以处理跨域图片（需要CORS支持）
 * - 生成的Base64可以直接使用
 * 
 * 限制：
 * - 受Canvas跨域策略限制，跨域图片需要CORS支持
 * - 转换后的图片质量可能受格式影响（如JPEG有损压缩）
 * - 大图片转换可能较慢，占用内存
 * 
 * @param url - 图片的URL地址
 * @param mineType - 输出的MIME类型（如 'image/png'、'image/jpeg'），默认为 'image/png'
 * @returns Promise<string> - 返回Base64编码的data URL字符串
 * @throws {Error} - 当Canvas创建失败或图片加载失败时抛出错误
 */
export function urlToBase64(url: string, mineType?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement('CANVAS') as HTMLCanvasElement | null;
    const ctx = canvas?.getContext('2d');
    const img = new Image();
    img.crossOrigin = '';
    img.addEventListener('load', () => {
      if (!canvas || !ctx) {
        return reject(new Error('Failed to create canvas.'));
      }
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL(mineType || 'image/png');
      canvas = null;
      resolve(dataURL);
    });
    img.src = url;
  });
}

/**
 * 通用下载触发函数
 * 
 * 使用场景：
 * - 所有下载方法的底层实现函数
 * - 统一处理文件下载的触发逻辑
 * - 支持对象URL、data URL、普通URL等多种URL类型
 * 
 * 原理：
 * 1. 创建隐藏的 <a> 标签元素
 *    - 设置 href 为文件URL（可以是普通URL、data URL或blob URL）
 *    - 设置 download 属性指定下载文件名
 *    - 设置 display: none 隐藏元素
 * 2. 兼容性处理：
 *    - 如果浏览器不支持 download 属性（如IE），则设置 target='_blank' 在新窗口打开
 *    - 支持 download 属性的浏览器会直接下载文件
 * 3. 触发下载：
 *    - 将 <a> 标签添加到DOM
 *    - 调用 link.click() 程序化触发点击事件
 *    - 立即从DOM中移除元素
 * 4. 内存清理：
 *    - 如果是对象URL（blob:），需要调用 URL.revokeObjectURL() 释放内存
 *    - 使用 setTimeout 延迟清理，确保下载已开始
 *    - 默认延迟100ms，可根据需要调整
 * 
 * 优点：
 * - 统一的下载触发逻辑，代码复用性高
 * - 自动处理内存清理，避免内存泄漏
 * - 兼容性好，支持各种浏览器
 * 
 * 注意事项：
 * - 对象URL必须及时清理，否则会导致内存泄漏
 * - 某些浏览器可能弹出下载确认对话框
 * - 跨域URL可能被浏览器阻止下载
 * 
 * @param href - 文件下载的 URL（可以是普通URL、data URL或blob URL）
 * @param fileName - 下载文件的名称，如果未提供则使用默认名称
 * @param revokeDelay - 清理对象URL的延迟时间（毫秒），默认100ms，确保下载已开始
 */
export function triggerDownload(
  href: string,
  fileName: string | undefined,
  revokeDelay: number = 100,
): void {
  const defaultFileName = 'downloaded_file';
  const finalFileName = fileName || defaultFileName;

  const link = document.createElement('a');
  link.href = href;
  link.download = finalFileName;
  link.style.display = 'none';

  if (link.download === undefined) {
    link.setAttribute('target', '_blank');
  }

  document.body.append(link);
  link.click();
  link.remove();

  // 清理临时 URL 以释放内存
  setTimeout(() => URL.revokeObjectURL(href), revokeDelay);
}

/**
 * 解析并返回下载文件名
 * 
 * 使用场景：
 * - 从URL中提取文件名
 * - 为下载文件提供默认文件名
 * - 处理没有文件名的URL情况
 * 
 * 原理：
 * 1. 优先级顺序：
 *    - 如果提供了 fileName 参数，直接使用
 *    - 否则从URL中提取文件名（最后一个 '/' 之后的部分）
 *    - 如果URL中也没有文件名，使用默认文件名 'downloaded_file'
 * 2. URL文件名提取：
 *    - 使用 lastIndexOf('/') 找到最后一个斜杠的位置
 *    - 使用 slice() 提取斜杠之后的所有字符
 *    - 这样可以处理带查询参数的URL（如：/path/file.pdf?token=xxx）
 * 
 * 示例：
 * - resolveFileName('https://example.com/file.pdf', 'custom.pdf') => 'custom.pdf'
 * - resolveFileName('https://example.com/file.pdf') => 'file.pdf'
 * - resolveFileName('https://example.com/') => 'downloaded_file'
 * 
 * @param url - 文件的URL地址
 * @param fileName - 可选的自定义文件名
 * @returns 解析后的文件名
 */
function resolveFileName(url: string, fileName?: string): string {
  return fileName || url.slice(url.lastIndexOf('/') + 1) || DEFAULT_FILENAME;
}

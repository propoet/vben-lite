/**
 * 动态加载外部 JavaScript 文件
 * 
 * @description
 * 此函数用于在运行时动态加载外部 JavaScript 资源，通过创建 script 标签并插入到 DOM 中实现。
 * 支持重复调用检测，避免同一脚本被多次加载。使用 Promise 机制实现异步加载，便于在 Vue/React 等
 * 现代框架中进行异步操作和错误处理。
 * 
 * @principle 实现原理
 * 
 * 1. **防重复加载机制**：
 *    - 使用 `document.querySelector(\`script[src="${src}"]\`)` 检查 DOM 中是否已存在相同 src 的 script 标签
 *    - 如果已存在，直接 resolve，避免重复加载和执行，确保脚本只执行一次
 *    - 这对于全局变量和单例模式的库特别重要（如 jQuery、ECharts 等）
 * 
 * 2. **动态创建 Script 元素**：
 *    - 使用 `document.createElement('script')` 创建 script 元素
 *    - 设置 `script.src` 为传入的 URL，此时浏览器会开始异步下载脚本文件
 *    - 脚本下载是异步的，不会阻塞页面渲染和 JavaScript 执行
 * 
 * 3. **事件监听机制**：
 *    - 监听 `load` 事件：脚本下载并执行完成后触发，此时脚本中的代码已执行完毕，全局变量已可用
 *    - 监听 `error` 事件：加载失败时触发（网络错误、404、CORS 问题等），调用 reject 并抛出错误
 *    - 使用 Promise 包装异步过程，提供现代化的异步编程接口
 * 
 * 4. **DOM 注入触发加载**：
 *    - 将 script 元素添加到 `document.head`，触发浏览器开始下载和执行脚本
 *    - 脚本执行是同步的，会阻塞后续脚本的执行，但不阻塞页面渲染
 *    - 脚本执行完成后，其中的全局变量、函数等会暴露到 window 对象上
 * 
 * @usage 使用场景
 * 
 * 1. **按需加载第三方库**（减少初始打包体积）：
 *    - 地图 SDK：百度地图、高德地图、Google Maps API
 *    - 图表库：ECharts、Chart.js、D3.js
 *    - 富文本编辑器：TinyMCE、CKEditor、Quill
 *    - 工具库：jQuery、Lodash（当需要时从 CDN 加载）
 * 
 * 2. **CDN 资源动态加载**：
 *    - 从 CDN 加载大型库，减少打包体积和首屏加载时间
 *    - 利用 CDN 的缓存优势，提高加载速度
 *    - 适用于不经常使用的库或插件
 * 
 * 3. **插件系统和扩展模块**：
 *    - 动态加载业务插件
 *    - 第三方集成模块（支付、统计、客服等）
 *    - 条件性功能模块（根据用户权限加载）
 * 
 * 4. **条件加载和懒加载**：
 *    - 根据用户设备类型加载不同的脚本（移动端/PC 端）
 *    - 根据用户权限加载管理员功能脚本
 *    - 路由级别的代码分割和按需加载
 * 
 * 5. **外部 SDK 集成**：
 *    - 支付 SDK（支付宝、微信支付）
 *    - 社交登录 SDK（微信、QQ、微博）
 *    - 统计分析 SDK（百度统计、Google Analytics）
 * 
 * @example
 * ```typescript
 * // 基础使用：加载 CDN 上的库
 * await loadScript('https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js');
 * console.log(window._); // 可以使用 lodash
 * 
 * // 在 Vue 组件中使用：按需加载地图
 * async function initBaiduMap() {
 *   try {
 *     await loadScript('https://api.map.baidu.com/api?v=3.0&ak=YOUR_AK');
 *     // 脚本加载成功后，BMap 全局变量已可用
 *     const map = new window.BMap.Map('mapContainer');
 *   } catch (error) {
 *     console.error('地图脚本加载失败:', error);
 *   }
 * }
 * 
 * // 条件加载：根据用户权限加载管理功能
 * if (userRole === 'admin') {
 *   await loadScript('/static/js/admin-tools.js');
 * }
 * 
 * // 加载多个脚本（并行加载）
 * await Promise.all([
 *   loadScript('https://cdn.example.com/lib1.js'),
 *   loadScript('https://cdn.example.com/lib2.js')
 * ]);
 * 
 * // 串行加载（有依赖关系时）
 * await loadScript('https://cdn.example.com/dependency.js');
 * await loadScript('https://cdn.example.com/main.js'); // 依赖 dependency.js
 * ```
 * 
 * @param src - JavaScript 文件的 URL 地址
 *   - 支持相对路径：`'/static/js/library.js'`
 *   - 支持绝对路径：`'https://cdn.example.com/library.js'`
 *   - 支持 CDN 链接：`'https://unpkg.com/library@1.0.0/dist/library.js'`
 * 
 * @returns Promise<void> - 加载成功时 resolve，失败时 reject 并抛出错误
 *   - resolve：脚本已成功下载并执行，可以安全使用脚本中的全局变量和函数
 *   - reject：加载失败，会抛出包含错误信息的 Error 对象
 * 
 * @throws {Error} 当脚本加载失败时，会 reject 并抛出包含错误信息的 Error 对象
 *   常见失败原因：
 *   - 网络错误：无法连接到服务器
 *   - 404 错误：文件不存在
 *   - CORS 错误：跨域资源共享限制
 *   - 服务器错误：5xx 状态码
 * 
 * @note 注意事项
 * 
 * 1. **异步执行**：脚本加载是异步的，必须使用 `await` 或 `.then()` 等待加载完成后再使用脚本中的内容
 * 
 * 2. **全局作用域污染**：加载的脚本会执行并可能修改全局作用域，建议使用命名空间或模块化的脚本
 * 
 * 3. **执行顺序**：如果多个脚本有依赖关系，需要确保加载顺序，使用 `await` 串行加载
 * 
 * 4. **错误处理**：务必使用 try-catch 或 .catch() 处理加载失败的情况，避免未捕获的 Promise 错误
 * 
 * 5. **重复调用安全**：多次调用相同的 src 是安全的，函数会检测并避免重复加载
 * 
 * 6. **CORS 限制**：如果从不同域加载脚本，需要确保目标服务器支持 CORS，否则可能加载失败
 * 
 * 7. **脚本执行时机**：脚本一旦加载成功会立即执行，可能会修改 DOM 或全局变量，需要注意执行时机
 */
function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    // 防重复加载：检查 DOM 中是否已存在相同 src 的 script 标签
    // 使用属性选择器精确匹配，避免重复加载和执行
    // 如果已存在，说明脚本已经加载过，直接 resolve，确保脚本只执行一次
    if (document.querySelector(`script[src="${src}"]`)) {
      // 如果已经加载过，直接 resolve，避免重复加载和执行
      // 这对于全局变量和单例模式的库特别重要
      return resolve();
    }
    
    // 动态创建 script 元素
    // 此时元素还未添加到 DOM，不会触发下载
    const script = document.createElement('script');
    
    // 设置脚本源地址
    // 设置 src 后，当元素添加到 DOM 时，浏览器会开始异步下载脚本
    script.src = src;
    
    // 监听加载成功事件
    // 当脚本下载并执行完成后触发，此时脚本中的代码已执行完毕
    // 全局变量、函数等已可用，可以安全地使用脚本中的内容
    script.addEventListener('load', () => resolve());
    
    // 监听加载失败事件
    // 触发场景：网络错误、404、CORS 问题、服务器错误等
    // 失败时 reject Promise，抛出包含错误信息的 Error 对象
    script.addEventListener('error', () =>
      reject(new Error(`Failed to load script: ${src}`)),
    );
    
    // 将 script 元素添加到 head，触发浏览器开始下载和执行
    // 添加到 DOM 后，浏览器会：
    // 1. 异步下载脚本文件（不阻塞页面渲染）
    // 2. 下载完成后同步执行脚本（会阻塞后续脚本执行）
    // 3. 执行完成后触发 load 事件
    document.head.append(script);
  });
}

export { loadScript };

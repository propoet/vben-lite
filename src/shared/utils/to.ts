/**
 * Promise 错误处理工具函数（Go 风格错误处理）
 * 
 * @description
 * 将 Promise 的错误处理从传统的 try-catch 模式转换为 Go 语言风格的错误处理模式。
 * 返回一个元组 [error, data]，成功时返回 [null, data]，失败时返回 [error, undefined]。
 * 这种模式使错误处理更加明确和统一，避免使用 try-catch 块，代码更加简洁。
 * 
 * @principle 实现原理
 * 
 * 1. **元组返回模式**：
 *    - 成功时：返回 `[null, T]`，第一个元素为 null 表示无错误，第二个元素为数据
 *    - 失败时：返回 `[U, undefined]`，第一个元素为错误对象，第二个元素为 undefined
 *    - 通过解构赋值可以清晰地处理成功和失败两种情况
 * 
 * 2. **错误捕获机制**：
 *    - 使用 try-catch 捕获 Promise 的 reject 或抛出的异常
 *    - 将捕获的错误转换为元组格式返回，而不是抛出异常
 *    - 这样调用者可以通过检查第一个元素是否为 null 来判断是否成功
 * 
 * 3. **错误扩展功能**：
 *    - 支持通过 `errorExt` 参数向错误对象添加额外的上下文信息
 *    - 使用 `Object.assign` 将额外信息合并到错误对象中
 *    - 便于在错误处理时添加调用栈、请求参数、时间戳等调试信息
 * 
 * 4. **类型安全**：
 *    - 使用泛型 `<T>` 指定 Promise 返回的数据类型
 *    - 使用泛型 `<U>` 指定错误类型，默认为 `Error`
 *    - 返回类型为联合类型，确保类型检查的准确性
 * 
 * @usage 使用场景
 * 
 * 1. **API 请求错误处理**：
 *    - 统一处理 HTTP 请求的成功和失败情况
 *    - 避免在每个请求处都写 try-catch
 *    - 使错误处理逻辑更加清晰和一致
 * 
 * 2. **异步操作错误处理**：
 *    - 文件读取、数据库操作等异步 I/O 操作
 *    - 第三方服务调用（支付、短信、邮件等）
 *    - 资源加载和初始化操作
 * 
 * 3. **批量操作处理**：
 *    - 处理多个异步操作，统一错误处理模式
 *    - 在循环中处理异步操作时，避免嵌套的 try-catch
 * 
 * 4. **函数式编程风格**：
 *    - 适合函数式编程范式
 *    - 与数组方法（map、filter、reduce）配合使用
 *    - 便于链式调用和组合
 * 
 * @example
 * ```typescript
 * // 场景1: API 请求处理
 * async function fetchUser(id: string) {
 *   const [error, user] = await to(fetch(`/api/users/${id}`).then(r => r.json()));
 *   
 *   if (error) {
 *     console.error('获取用户失败:', error);
 *     return null;
 *   }
 *   
 *   return user;
 * }
 * 
 * // 场景2: 带错误扩展信息
 * async function saveData(data: any) {
 *   const [error, result] = await to(
 *     api.post('/data', data),
 *     { operation: 'saveData', timestamp: Date.now() }
 *   );
 *   
 *   if (error) {
 *     // error 对象包含原始错误信息和 errorExt 中的额外信息
 *     console.error('保存失败:', error);
 *     return false;
 *   }
 *   
 *   return true;
 * }
 * 
 * // 场景3: 条件处理（更简洁的写法）
 * const [error, data] = await to(fetchData());
 * if (error) {
 *   // 处理错误
 *   handleError(error);
 *   return;
 * }
 * // 处理成功的数据
 * processData(data);
 * 
 * // 场景4: 与数组方法配合
 * const results = await Promise.all(
 *   items.map(item => to(processItem(item)))
 * );
 * 
 * results.forEach(([error, result]) => {
 *   if (error) {
 *     console.error('处理失败:', error);
 *   } else {
 *     console.log('处理成功:', result);
 *   }
 * });
 * 
 * // 场景5: 对比传统 try-catch 方式
 * // 传统方式：
 * try {
 *   const data = await fetchData();
 *   processData(data);
 * } catch (error) {
 *   handleError(error);
 * }
 * 
 * // 使用 to 函数：
 * const [error, data] = await to(fetchData());
 * if (error) {
 *   handleError(error);
 * } else {
 *   processData(data);
 * }
 * ```
 * 
 * @param promise - 要处理的 Promise 对象（只读，确保不会被修改）
 * @param errorExt - 可选的错误扩展对象，用于向错误对象添加额外的上下文信息
 *   - 这些属性会被合并到错误对象中
 *   - 常用于添加调用栈、请求参数、时间戳等调试信息
 *   - 例如：`{ operation: 'fetchUser', userId: '123', timestamp: Date.now() }`
 * 
 * @returns Promise<[null, T] | [U, undefined]>
 *   - 成功时：返回 `[null, T]`，T 是 Promise 解析的数据类型
 *   - 失败时：返回 `[U, undefined]`，U 是错误类型（默认为 Error）
 *   - 使用解构赋值：`const [error, data] = await to(promise)`
 * 
 * @note 注意事项
 * 
 * 1. **解构赋值模式**：必须使用解构赋值来获取结果，第一个元素是错误，第二个元素是数据
 * 
 * 2. **错误检查**：使用前必须检查第一个元素是否为 null，不能直接使用第二个元素
 * 
 * 3. **类型推断**：TypeScript 会根据 Promise 的类型自动推断返回的数据类型
 * 
 * 4. **错误扩展**：errorExt 中的属性会覆盖错误对象中的同名属性，注意属性冲突
 * 
 * 5. **性能考虑**：相比 try-catch，这种模式在性能上几乎没有差异，主要是代码风格的改变
 * 
 * 6. **适用场景**：适合需要明确处理错误的场景，不适合需要让错误向上传播的场景
 */
export async function to<T, U = Error>(
  promise: Readonly<Promise<T>>,
  errorExt?: object,
): Promise<[null, T] | [U, undefined]> {
  try {
    // 等待 Promise 解析，获取数据
    const data = await promise;
    // 成功时返回 [null, data] 元组
    // null 表示没有错误，data 是 Promise 解析的结果
    const result: [null, T] = [null, data];
    return result;
  } catch (error) {
    // 捕获 Promise 的 reject 或抛出的异常
    if (errorExt) {
      // 如果提供了错误扩展对象，将其属性合并到错误对象中
      // 使用 Object.assign 创建新对象，避免修改原始错误对象
      // 这样可以添加额外的上下文信息，如操作名称、时间戳、请求参数等
      const parsedError = Object.assign({}, error, errorExt);
      // 返回 [error, undefined]，error 包含原始错误和扩展信息
      return [parsedError as U, undefined];
    }
    // 没有错误扩展时，直接返回原始错误
    // 返回 [error, undefined]，表示失败，没有数据
    return [error as U, undefined];
  }
}

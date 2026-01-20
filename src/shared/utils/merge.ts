import { createDefu } from 'defu';

export { createDefu as createMerge, defu as merge } from 'defu';

/**
 * 创建带有数组覆盖策略的对象合并函数
 * 
 * 使用场景：
 * - 配置对象合并时，需要数组完全替换而不是合并（如主题配置中的颜色列表）
 * - 用户偏好设置合并，数组类型的配置项应该完全覆盖而不是追加
 * - 表单配置合并，选项列表（options）应该完全替换
 * - 组件配置合并，当数组表示互斥的配置项时（如路由配置、菜单项等）
 * - 处理默认配置和用户自定义配置的合并，确保用户配置的数组完全覆盖默认数组
 * 
 * 原理：
 * 1. 使用 defu 库的 createDefu 函数创建自定义合并策略
 * 2. 自定义合并函数接收三个参数：
 *    - originObj: 源对象（原始配置）
 *    - key: 当前正在合并的键名
 *    - updates: 更新对象（新配置）
 * 3. 检查逻辑：
 *    - 如果源对象中该键的值是数组，且更新对象中该键的值也是数组
 *    - 则直接用更新数组完全替换源数组（originObj[key] = updates）
 *    - 返回 true 表示已处理该键，跳过默认的深度合并逻辑
 * 4. 如果不满足条件（不是数组或只有一方是数组），返回 undefined
 *    - defu 会继续使用默认的合并策略（深度合并对象，其他情况按默认处理）
 * 
 * 与默认 merge 的区别：
 * - 默认 merge：对于数组可能进行合并或追加操作
 * - mergeWithArrayOverride：数组总是完全替换，不会合并或追加
 * 
 * 优点：
 * - 明确控制数组的合并行为，避免意外的数组合并
 * - 适合配置场景，确保用户配置完全覆盖默认配置
 * - 保持对象的深度合并能力，只改变数组的处理方式
 * 
 * 示例：
 * ```typescript
 * const defaultConfig = {
 *   colors: ['red', 'blue'],
 *   theme: { mode: 'light' }
 * };
 * const userConfig = {
 *   colors: ['green', 'yellow'],
 *   theme: { mode: 'dark' }
 * };
 * 
 * // 使用 mergeWithArrayOverride
 * const result = mergeWithArrayOverride(defaultConfig, userConfig);
 * // result.colors => ['green', 'yellow'] (完全替换)
 * // result.theme => { mode: 'dark' } (深度合并)
 * 
 * // 如果使用默认 merge，colors 可能是 ['red', 'blue', 'green', 'yellow'] (合并)
 * ```
 * 
 * 注意事项：
 * - 只影响数组类型的值，对象类型仍然会深度合并
 * - 如果源对象没有该键，或更新对象没有该键，会按默认策略处理
 * - 适用于需要精确控制数组替换的场景，不适合需要数组合并的场景
 */
export const mergeWithArrayOverride = createDefu((originObj, key, updates) => {
  if (Array.isArray(originObj[key]) && Array.isArray(updates)) {
    originObj[key] = updates;
    return true;
  }
});

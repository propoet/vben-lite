import type { RouteLocationNormalized } from 'vue-router'

/**
 * 标签页定义接口
 * 
 * TabDefinition 继承自 RouteLocationNormalized，包含路由的所有信息，
 * 并添加了可选的 key 属性用于唯一标识标签页。
 * 
 * 完整字段列表：
 * 
 * 来自 RouteLocationNormalized 的字段：
 * - name: string | symbol | undefined | null - 路由名称
 * - path: string - 路由路径
 * - fullPath: string - 完整路径（包含查询参数和哈希）
 * - params: RouteParams - 路由参数对象
 * - query: LocationQuery - 查询参数对象
 * - hash: string - 哈希值
 * - matched: RouteRecordNormalized[] - 匹配的路由记录数组
 * - meta: RouteMeta - 路由元信息（可包含自定义字段）
 * - redirectedFrom: RouteLocationNormalized | undefined - 重定向来源
 * 
 * TabDefinition 自己添加的字段：
 * - key?: string - 标签页的唯一标识符（可选，如果不提供会根据路由信息自动生成）
 * 
 * meta 中常用的自定义字段（在 vben 中使用）：
 * - meta.affixTab?: boolean - 是否固定标签页
 * - meta.title?: string | ComputedRef<string> - 标签页标题
 * - meta.newTabTitle?: string | ComputedRef<string> - 自定义标签页标题
 * - meta.keepAlive?: boolean - 是否缓存（用于 keep-alive）
 * - meta.hideInTab?: boolean - 是否在标签页中隐藏
 * - meta.fullPathKey?: boolean - 是否使用完整路径作为 key
 * - meta.maxNumOfOpenTab?: number - 该路由最大打开标签页数量
 * - meta.affixTabOrder?: number - 固定标签页的排序顺序
 * 
 * 使用场景：
 * - 标签页管理：打开、关闭、固定、刷新等
 * - 路由缓存：根据 keepAlive 决定是否缓存组件
 * - 标签页显示：根据 hideInTab 决定是否显示
 * - 标签页标题：支持静态标题和动态标题（ComputedRef）
 */
export interface TabDefinition extends RouteLocationNormalized {
  /**
   * 标签页的key，用于唯一标识标签页
   * 如果不提供，将根据路由信息自动生成
   * 
   * key 生成规则（在 getTabKey 函数中）：
   * 1. 如果 query.pageKey 存在，使用 pageKey
   * 2. 如果 meta.fullPathKey 为 false，使用 path
   * 3. 否则使用 fullPath
   */
  key?: string
}

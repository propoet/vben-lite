import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 扩展路由原始对象
 */
type ExRouteRecordRaw = RouteRecordRaw & {
  parent?: string
  parents?: string[]
  path?: any
}
/**
 * 徽标原始对象
 */
interface MenuRecordBadgeRaw {
  /**
   * 徽标
   */
  badge?: string
  /**
   * 徽标类型
   */
  badgeType?: 'dot' | 'normal'
  /**
   * 徽标颜色
   */
  badgeVariants?: 'destructive' | 'primary' | string
}

/**
 * 菜单原始对象
 * 用于定义菜单结构，支持嵌套子菜单、图标、徽标等功能
 */

interface MenuRecordRaw extends MenuRecordBadgeRaw {
  /**
   * 激活时的图标名
   */
  activeIcon?: string
  /**
   * 子菜单
   */
  children?: MenuRecordRaw[]
  /**
   * 是否禁用菜单
   */
  disabled?: boolean
  /**
   * 图标名
   */
  icon?: Component | string
  /**
   * 菜单名
   */
  name: string
  /**
   * 排序号
   */
  order?: number
  /**
   * 父级路径
   */
  parent?: string
  /**
   * 所有父级路径
   */
  parents?: string[]
  /**
   * 菜单路径，唯一，可当作key
   */
  path: string
  /**
   * 是否显示菜单
   */
  show?: boolean
}
export type { ExRouteRecordRaw, MenuRecordBadgeRaw, MenuRecordRaw }

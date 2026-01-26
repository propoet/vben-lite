/** 用户信息类型*/
export interface UserInfo {
  userId: string
  username: string
  realName: string
  avatar: string
  roles?: string[]
  homePath?: string
  [key: string]: any
}

/**可记录类型,定义一个键为字符串,值为类型T的对象类型 */

export type Recordable<T = any> = Record<string, T>

export type * from '#/preferences/types'

// 菜单相关类型
export type * from './menu-record'
// 标签页相关类型
export type * from './tabs'
// 基础类型（BasicUserInfo, BasicOption 等）
export type * from './basic'
// 应用类型（TimezoneOption 等）
export type * from './app'

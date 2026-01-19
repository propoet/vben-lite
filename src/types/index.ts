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
/** 基础选项类型*/
export interface BasicOptions {
  label: string
  value: string | number | boolean
}
/**可记录类型,定义一个键为字符胡灿,值为类型T的对象类型 */

export type Recordable<T = any> = Record<string, T>

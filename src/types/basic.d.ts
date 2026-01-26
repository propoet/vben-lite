/**
 * 基础选项接口
 * 用于下拉选择、标签页选项等场景
 */
interface BasicOption {
  label: string
  value: string
}

type SelectOption = BasicOption

type TabOption = BasicOption
/**
 * 基础用户信息接口
 * 定义了用户的基本信息结构，包括头像、昵称、角色等
 *
 * 注意：此类型与项目中 src/types/index.ts 中的 UserInfo 类型类似，
 * 但 UserInfo 可能包含更多字段（如 homePath 等）。
 * Store 中使用 BasicUserInfo 作为基础类型，可以扩展为 UserInfo。
 */
interface BasicUserInfo {
  /**
   * 头像
   */
  avatar: string
  /**
   * 用户昵称
   */
  realName: string
  /**
   * 用户角色
   */
  roles?: string[]
  /**
   * 用户id
   */
  userId: string
  /**
   * 用户名
   */
  username: string
  /**
   * 允许其他字段（与项目中的 UserInfo 兼容）
   */
  [key: string]: any
}

type ClassType = Array<object | string> | object | string

export type { BasicOption, BasicUserInfo, ClassType, SelectOption, TabOption }

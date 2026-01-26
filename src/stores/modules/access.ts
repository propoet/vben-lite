import type { RouteRecordRaw } from 'vue-router'

import type { MenuRecordRaw } from '../types'

import { acceptHMRUpdate, defineStore } from 'pinia'

type AccessToken = null | string

/**
 * 访问权限状态接口
 * 定义了权限管理相关的所有状态
 */
interface AccessState {
  /**
   * 权限码
   * 用于前端权限控制，例如：['user:read', 'user:write']
   */
  accessCodes: string[]
  /**
   * 可访问的菜单列表
   * 根据用户权限过滤后的菜单结构
   */
  accessMenus: MenuRecordRaw[]
  /**
   * 可访问的路由列表
   * 根据用户权限动态生成的路由配置
   */
  accessRoutes: RouteRecordRaw[]
  /**
   * 登录 accessToken
   * 用于 API 请求的身份验证
   */
  accessToken: AccessToken
  /**
   * 是否已经检查过权限
   * 用于判断是否需要进行权限检查
   */
  isAccessChecked: boolean
  /**
   * 是否锁屏状态
   * 用于锁屏功能
   */
  isLockScreen: boolean
  /**
   * 锁屏密码
   * 用于解锁验证
   */
  lockScreenPassword?: string
  /**
   * 登录是否过期
   * 用于判断是否需要重新登录
   */
  loginExpired: boolean
  /**
   * 登录 refreshToken
   * 用于刷新 accessToken
   */
  refreshToken: AccessToken
}

/**
 * @zh_CN 访问权限相关 Store
 *
 * 功能说明：
 * 1. 管理用户登录状态（accessToken、refreshToken）
 * 2. 管理用户权限（权限码、可访问菜单、可访问路由）
 * 3. 管理锁屏状态
 * 4. 提供权限检查、菜单查找等功能
 *
 * 持久化说明：
 * - accessToken、refreshToken：持久化，用于保持登录状态
 * - accessCodes：持久化，用于权限判断
 * - isLockScreen、lockScreenPassword：持久化，用于锁屏功能
 * - 其他字段不持久化，每次刷新后重新初始化
 *
 * 使用场景：
 * - 用户登录后设置 token
 * - 权限路由守卫中检查权限
 * - 菜单渲染时过滤菜单
 * - 锁屏/解锁功能
 */
export const useAccessStore = defineStore('core-access', {
  /**
   * Actions：定义修改状态的方法
   */
  actions: {
    /**
     * 根据路径获取菜单
     *
     * 功能说明：
     * 在菜单树中递归查找指定路径的菜单项
     *
     * 使用场景：
     * - 根据路由路径获取对应的菜单配置
     * - 菜单高亮显示
     * - 面包屑导航
     *
     * @param path 菜单路径
     * @returns 找到的菜单项，如果未找到则返回 undefined
     */
    getMenuByPath(path: string) {
      /**
       * 递归查找菜单的内部函数
       * @param menus 菜单列表
       * @param path 要查找的路径
       * @returns 找到的菜单项
       */
      function findMenu(menus: MenuRecordRaw[], path: string): MenuRecordRaw | undefined {
        // 遍历菜单列表
        for (const menu of menus) {
          // 如果当前菜单的路径匹配，直接返回
          if (menu.path === path) {
            return menu
          }
          // 如果有子菜单，递归查找
          if (menu.children) {
            const matched = findMenu(menu.children, path)
            if (matched) {
              return matched
            }
          }
        }
      }
      return findMenu(this.accessMenus, path)
    },

    /**
     * 锁屏
     *
     * 功能说明：
     * 设置锁屏状态和锁屏密码
     *
     * @param password 锁屏密码
     */
    lockScreen(password: string) {
      this.isLockScreen = true
      this.lockScreenPassword = password
    },

    /**
     * 设置权限码
     *
     * 功能说明：
     * 设置用户的权限码列表，用于前端权限控制
     *
     * @param codes 权限码数组
     */
    setAccessCodes(codes: string[]) {
      this.accessCodes = codes
    },

    /**
     * 设置可访问菜单
     *
     * 功能说明：
     * 设置根据用户权限过滤后的菜单列表
     *
     * @param menus 菜单列表
     */
    setAccessMenus(menus: MenuRecordRaw[]) {
      this.accessMenus = menus
    },

    /**
     * 设置可访问路由
     *
     * 功能说明：
     * 设置根据用户权限动态生成的路由配置
     *
     * @param routes 路由列表
     */
    setAccessRoutes(routes: RouteRecordRaw[]) {
      this.accessRoutes = routes
    },

    /**
     * 设置访问令牌
     *
     * 功能说明：
     * 设置用户的 accessToken，用于 API 请求的身份验证
     *
     * @param token 访问令牌
     */
    setAccessToken(token: AccessToken) {
      this.accessToken = token
    },

    /**
     * 设置权限检查状态
     *
     * 功能说明：
     * 标记是否已经进行过权限检查
     *
     * @param isAccessChecked 是否已检查
     */
    setIsAccessChecked(isAccessChecked: boolean) {
      this.isAccessChecked = isAccessChecked
    },

    /**
     * 设置登录过期状态
     *
     * 功能说明：
     * 标记登录是否已过期
     *
     * @param loginExpired 是否过期
     */
    setLoginExpired(loginExpired: boolean) {
      this.loginExpired = loginExpired
    },

    /**
     * 设置刷新令牌
     *
     * 功能说明：
     * 设置用户的 refreshToken，用于刷新 accessToken
     *
     * @param token 刷新令牌
     */
    setRefreshToken(token: AccessToken) {
      this.refreshToken = token
    },

    /**
     * 解锁屏幕
     *
     * 功能说明：
     * 清除锁屏状态和锁屏密码
     */
    unlockScreen() {
      this.isLockScreen = false
      this.lockScreenPassword = undefined
    }
  },

  /**
   * 持久化配置
   * 只持久化指定的字段，其他字段每次刷新后重新初始化
   */
  persist: {
    // 持久化字段
    pick: [
      'accessToken', // 访问令牌
      'refreshToken', // 刷新令牌
      'accessCodes', // 权限码
      'isLockScreen', // 锁屏状态
      'lockScreenPassword' // 锁屏密码
    ]
  },

  /**
   * State：定义 Store 的初始状态
   */
  state: (): AccessState => ({
    accessCodes: [],
    accessMenus: [],
    accessRoutes: [],
    accessToken: null,
    isAccessChecked: false,
    isLockScreen: false,
    lockScreenPassword: undefined,
    loginExpired: false,
    refreshToken: null
  })
})

// 解决热更新问题
const hot = import.meta.hot
if (hot) {
  hot.accept(acceptHMRUpdate(useAccessStore, hot))
}

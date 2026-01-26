import { acceptHMRUpdate, defineStore } from 'pinia';

/**
 * 基础用户信息接口
 * 定义了用户的基本信息结构，包括头像、昵称、角色等
 * 注意：此接口在 user.ts 中定义，与 types/basic.d.ts 中的定义保持一致
 */
interface BasicUserInfo {
  [key: string]: any;
  /**
   * 头像
   */
  avatar: string;
  /**
   * 用户昵称
   */
  realName: string;
  /**
   * 用户角色
   */
  roles?: string[];
  /**
   * 用户id
   */
  userId: string;
  /**
   * 用户名
   */
  username: string;
}

/**
 * 用户信息状态接口
 * 定义了用户 Store 的状态结构
 */
interface AccessState {
  /**
   * 用户信息
   */
  userInfo: BasicUserInfo | null;
  /**
   * 用户角色
   */
  userRoles: string[];
}

/**
 * @zh_CN 用户信息相关 Store
 * 
 * 功能说明：
 * 1. 管理用户基本信息（头像、昵称、用户名等）
 * 2. 管理用户角色信息
 * 3. 提供设置用户信息和角色的方法
 * 
 * 使用场景：
 * - 用户登录后设置用户信息
 * - 获取当前登录用户信息
 * - 权限判断时获取用户角色
 * - 用户信息更新
 * 
 * 注意：
 * - 此 Store 不进行持久化，因为用户信息通常存储在 access store 中
 * - 用户信息与角色信息是分离的，便于灵活管理
 */
export const useUserStore = defineStore('core-user', {
  /**
   * Actions：定义修改状态的方法
   */
  actions: {
    /**
     * 设置用户信息
     * 
     * 功能说明：
     * 1. 设置用户基本信息
     * 2. 自动提取并设置用户角色
     * 
     * @param userInfo 用户信息对象，如果为 null 则清空用户信息
     */
    setUserInfo(userInfo: BasicUserInfo | null) {
      // 设置用户信息
      this.userInfo = userInfo;
      // 设置角色信息
      // 如果 userInfo 存在且有 roles 属性，则使用它；否则使用空数组
      const roles = userInfo?.roles ?? [];
      this.setUserRoles(roles);
    },
    
    /**
     * 设置用户角色
     * 
     * 功能说明：
     * 单独设置用户角色，不修改其他用户信息
     * 
     * 使用场景：
     * - 角色权限更新
     * - 角色切换
     * 
     * @param roles 角色数组
     */
    setUserRoles(roles: string[]) {
      this.userRoles = roles;
    },
  },
  
  /**
   * State：定义 Store 的初始状态
   */
  state: (): AccessState => ({
    userInfo: null,
    userRoles: [],
  }),
});

// 解决热更新问题
// 在开发环境下，当文件被修改时，Vite 会进行热更新
// acceptHMRUpdate 确保 Store 能够正确更新，而不会丢失状态
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useUserStore, hot));
}

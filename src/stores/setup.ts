import type { Pinia } from 'pinia'
import type { App } from 'vue'

import { createPinia } from 'pinia'
import SecureLS from 'secure-ls'

let pinia: Pinia

/**
 * 初始化 Store 的选项接口
 */
export interface InitStoreOptions {
  /**
   * @zh_CN 应用名,由于 @vben/stores 是公用的，后续可能有多个app，为了防止多个app缓存冲突，可在这里配置应用名,应用名将被用于持久化的前缀
   * 例如：'vben-lite-1.0.0-dev'，这样不同应用的 store 数据不会互相干扰
   */
  namespace: string
}

/**
 * @zh_CN 初始化pinia
 *
 * 功能说明：
 * 1. 创建 Pinia 实例
 * 2. 配置持久化插件（pinia-plugin-persistedstate）
 * 3. 在开发环境使用 localStorage，生产环境使用加密存储（SecureLS）
 * 4. 将 Pinia 实例注册到 Vue 应用中
 *
 * 持久化策略：
 * - 开发环境：使用 localStorage，方便调试
 * - 生产环境：使用 SecureLS 加密存储，提高安全性
 * - 存储 key 格式：{namespace}-{store.id}，避免多应用冲突
 *
 * @param app Vue 应用实例
 * @param options 初始化选项，包含命名空间
 * @returns Pinia 实例
 */
export async function initStores(app: App, options: InitStoreOptions) {
  // 动态导入持久化插件，减少初始包大小
  const { createPersistedState } = await import('pinia-plugin-persistedstate')
  // 创建 Pinia 实例
  pinia = createPinia()

  const { namespace } = options
  // 创建 SecureLS 实例，用于生产环境的加密存储
  // SecureLS 提供了 AES 加密、压缩等功能，提高数据安全性
  const ls = new SecureLS({
    encodingType: 'aes', // 使用 AES 加密
    encryptionSecret: import.meta.env.VITE_APP_STORE_SECURE_KEY, // 从环境变量获取加密密钥
    isCompression: true, // 启用压缩，减少存储空间
    // @ts-expect-error secure-ls does not have a type definition for this
    metaKey: `${namespace}-secure-meta` // 元数据 key，用于存储加密相关的元信息
  })
  pinia.use(
    createPersistedState({
      // key 生成函数：格式为 {namespace}-{store.id}
      // 例如：'vben-lite-1.0.0-dev-core-user'
      key: (storeKey) => `${namespace}-${storeKey}`,

      // 存储适配器
      // 开发环境使用 localStorage（方便调试）
      // 生产环境使用 SecureLS（加密存储，提高安全性）
      storage: import.meta.env.DEV
        ? localStorage
        : {
            getItem(key) {
              return ls.get(key)
            },
            setItem(key, value) {
              ls.set(key, value)
            }
          }
    })
  )
  // 将 Pinia 注册到 Vue 应用
  app.use(pinia)

  return pinia
}
/**
 * 重置所有 Store
 *
 * 功能说明：
 * 遍历所有已注册的 Store，调用其 $reset 方法重置状态
 * 常用于用户登出、清除数据等场景
 *
 * 使用场景：
 * - 用户登出时清除所有状态
 * - 切换账号时重置数据
 * - 应用初始化时清除旧数据
 */
export function resetAllStores() {
  if (!pinia) {
    console.error('Pinia is not installed')
    return
  }

  // 获取所有已注册的 Store
  // pinia._s 是 Pinia 内部存储所有 Store 实例的 Map
  const allStores = (pinia as any)._s

  // 遍历所有 Store，调用 $reset 方法重置状态
  for (const [_key, store] of allStores) {
    store.$reset()
  }
}

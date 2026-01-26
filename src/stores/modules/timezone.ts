import { ref, unref } from 'vue'

import { DEFAULT_TIME_ZONE_OPTIONS } from '#/preferences'
import { getCurrentTimezone, setCurrentTimezone } from '#/shared/utils'

import { acceptHMRUpdate, defineStore } from 'pinia'

/**
 * 时区处理模块接口
 * 定义了时区相关的操作方法，支持自定义实现
 */
interface TimezoneHandler {
  /**
   * 获取时区
   * 可以从服务器、用户配置等获取时区
   */
  getTimezone?: () => Promise<null | string | undefined>
  /**
   * 获取时区选项列表
   * 返回可选的时区列表
   */
  getTimezoneOptions?: () => Promise<
    {
      label: string
      value: string
    }[]
  >
  /**
   * 设置时区
   * 可以将时区保存到服务器、用户配置等
   */
  setTimezone?: (timezone: string) => Promise<void>
}

/**
 * 默认时区处理模块
 * 时区存储基于pinia存储插件
 *
 * 功能说明：
 * 提供默认的时区选项列表，时区的实际存储由 pinia-plugin-persistedstate 处理
 */
const getDefaultTimezoneHandler = (): TimezoneHandler => {
  return {
    getTimezoneOptions: () => {
      return Promise.resolve(
        DEFAULT_TIME_ZONE_OPTIONS.map((item) => {
          return {
            label: item.label,
            value: item.timezone
          }
        })
      )
    }
  }
}

/**
 * 自定义时区处理模块
 * 用于扩展时区功能，例如从服务器获取时区、保存时区到服务器等
 */
let customTimezoneHandler: null | Partial<TimezoneHandler> = null

/**
 * 设置自定义时区处理模块
 *
 * 功能说明：
 * 允许用户自定义时区的获取和保存逻辑
 *
 * 使用场景：
 * - 从服务器获取用户时区设置
 * - 将时区设置保存到服务器
 * - 自定义时区选项列表
 *
 * @param handler 自定义时区处理模块
 */
const setTimezoneHandler = (handler: Partial<TimezoneHandler>) => {
  customTimezoneHandler = handler
}

/**
 * 获取时区处理模块
 *
 * 功能说明：
 * 合并默认处理模块和自定义处理模块
 * 自定义处理模块的优先级更高
 *
 * @returns 合并后的时区处理模块
 */
const getTimezoneHandler = () => {
  return {
    ...getDefaultTimezoneHandler(),
    ...customTimezoneHandler
  }
}

/**
 * timezone支持模块
 *
 * 功能说明：
 * 1. 管理当前时区设置
 * 2. 初始化时区（从存储或系统获取）
 * 3. 设置时区（更新存储和 dayjs 默认时区）
 * 4. 获取时区选项列表
 *
 * 持久化说明：
 * - timezone：持久化，页面刷新后恢复时区设置
 *
 * 使用场景：
 * - 应用启动时初始化时区
 * - 用户切换时区
 * - 日期时间格式化时使用当前时区
 */
const useTimezoneStore = defineStore(
  'core-timezone',
  () => {
    // 使用 ref 创建响应式的时区状态
    const timezoneRef = ref(getCurrentTimezone())

    /**
     * 初始化时区
     * Initialize the timezone
     *
     * 功能说明：
     * 1. 尝试从自定义处理模块获取时区（例如从服务器）
     * 2. 如果获取到，则使用该时区
     * 3. 否则使用存储中的时区或系统时区
     * 4. 设置 dayjs 的默认时区
     */
    async function initTimezone() {
      const timezoneHandler = getTimezoneHandler()
      const timezone = await timezoneHandler.getTimezone?.()
      if (timezone) {
        timezoneRef.value = timezone
      }
      // 设置dayjs默认时区
      setCurrentTimezone(unref(timezoneRef))
    }

    /**
     * 设置时区
     * Set the timezone
     *
     * 功能说明：
     * 1. 调用自定义处理模块保存时区（例如保存到服务器）
     * 2. 更新本地时区状态
     * 3. 设置 dayjs 的默认时区
     *
     * @param timezone 时区字符串，例如：'Asia/Shanghai'
     */
    async function setTimezone(timezone: string) {
      const timezoneHandler = getTimezoneHandler()
      // 如果提供了自定义保存逻辑，则调用
      await timezoneHandler.setTimezone?.(timezone)
      timezoneRef.value = timezone
      // 设置dayjs默认时区
      setCurrentTimezone(timezone)
    }

    /**
     * 获取时区选项
     * Get the timezone options
     *
     * 功能说明：
     * 获取可选的时区列表，用于时区选择器
     *
     * @returns 时区选项列表
     */
    async function getTimezoneOptions() {
      const timezoneHandler = getTimezoneHandler()
      return (await timezoneHandler.getTimezoneOptions?.()) || []
    }

    // 初始化时区（在 Store 创建时自动调用）
    initTimezone().catch((error) => {
      console.error('Failed to initialize timezone during store setup:', error)
    })

    /**
     * 重置时区
     *
     * 功能说明：
     * 重置时区为系统默认时区
     */
    function $reset() {
      timezoneRef.value = getCurrentTimezone()
    }

    return {
      timezone: timezoneRef,
      setTimezone,
      getTimezoneOptions,
      $reset
    }
  },
  {
    persist: {
      // 持久化
      pick: ['timezone']
    }
  }
)

export { setTimezoneHandler, useTimezoneStore }

// 解决热更新问题
const hot = import.meta.hot
if (hot) {
  hot.accept(acceptHMRUpdate(useTimezoneStore, hot))
}

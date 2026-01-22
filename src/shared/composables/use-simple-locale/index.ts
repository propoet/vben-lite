import type { Locale } from './messages'

import { computed, ref } from 'vue'

import { createSharedComposable } from '@vueuse/core'

import { getMessages } from './messages'

/**
 * 简单国际化 Composable
 *
 * 这是一个轻量级的国际化方案，适用于不需要完整 i18n 功能的场景
 *
 * 使用场景：
 * - 简单的提示信息
 * - 按钮文本
 * - 不需要复杂嵌套结构的场景
 *
 * 与 vue-i18n 的区别：
 * - vue-i18n: 功能完整，支持复数、插值、嵌套等复杂功能
 * - useSimpleLocale: 轻量级，只支持简单的键值查找
 *
 * 优势：
 * - 不需要 vue-i18n 的额外开销
 * - 性能好，直接键值查找
 * - 适合简单的国际化需求
 *
 * @example
 * // 在组件中使用
 * import { useSimpleLocale } from '#/shared/composables/use-simple-locale';
 *
 * const { $t, setSimpleLocale } = useSimpleLocale();
 *
 * // 使用翻译
 * const text = $t.value('confirm'); // '确认' 或 'Confirm'
 *
 * // 切换语言
 * setSimpleLocale('en-US');
 * const text2 = $t.value('confirm'); // 'Confirm'
 */
export const useSimpleLocale = createSharedComposable(() => {
  /**
   * 当前语言
   * 使用 ref 创建响应式引用
   */
  const currentLocale = ref<Locale>('zh-CN')

  /**
   * 设置语言
   *
   * @param locale - 语言代码
   */
  const setSimpleLocale = (locale: Locale) => {
    currentLocale.value = locale
  }

  /**
   * 翻译函数
   * 使用 computed 创建计算属性，当语言改变时自动更新
   *
   * @returns 返回翻译函数
   */
  const $t = computed(() => {
    // 获取当前语言的消息对象
    const localeMessages = getMessages(currentLocale.value)

    // 返回翻译函数
    return (key: string) => {
      // 如果找到翻译，返回翻译文本
      // 如果找不到，返回键值本身（便于调试）
      return localeMessages[key] || key
    }
  })

  return {
    $t,
    currentLocale,
    setSimpleLocale
  }
})

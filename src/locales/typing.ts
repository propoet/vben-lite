/**
 * 支持的语言类型
 * 目前支持中文和英文
 */
export type SupportedLanguagesType = 'en-US' | 'zh-CN'

/**
 * 语言包导入函数类型
 * 返回一个 Promise，解析后包含默认导出的语言包对象
 */
export type ImportLocaleFn = () => Promise<{ default: Record<string, string> }>

/**
 * 加载消息函数类型
 * 用于加载额外的消息（如第三方组件库的语言包）
 * @param lang - 语言代码
 * @returns 返回语言包对象或 undefined
 */

export type LoadMessageFn = (
  lang: SupportedLanguagesType
) => Promise<Record<string, string> | undefined>

/**
 * 国际化设置选项
 * 用于配置国际化设置
 * @param lang - 语言代码
 * @returns 返回语言包对象或 undefined
 */
export interface LocaleSetupOptions {
  /**
   * 默认语言
   * @default zh-CN
   */
  defaultLocale?: SupportedLanguagesType
  /**
   * 加载消息函数
   * 用于加载额外的消息（如第三方组件库的语言包）
   * @param lang - 语言代码
   * @returns 返回语言包对象或 undefined
   */
  loadMessages?: LoadMessageFn
  /**
   * 是否在开发环境警告缺失的翻译键
   * @default false
   */
  missingWarn?: boolean
}

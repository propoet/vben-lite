import type { Language } from 'element-plus/es/locale';

import type { App } from 'vue';

import type { LocaleSetupOptions, SupportedLanguagesType } from './typing';

import { ref } from 'vue';

import {
  setupI18n as coreSetup,
  loadLocalesMapFromDir,
} from './i18n';
import { preferences } from '#/preferences';

import dayjs from 'dayjs';
import enLocale from 'element-plus/es/locale/lang/en';
import defaultLocale from 'element-plus/es/locale/lang/zh-cn';


/**
 * Element Plus 语言包引用
 * 使用 ref 创建响应式引用，语言切换时自动更新
 * 初始值为中文语言包
 */
const elementLocale = ref<Language>(defaultLocale);

/**
 * 使用 Vite 的 glob 导入功能，扫描应用层的语言包
 * 应用层可以有自己的语言包，与核心语言包分离
 */
const modules = import.meta.glob('./langs/**/*.json');

/**
 * 从目录结构加载语言包映射
 * 解析应用层的语言包文件
 */
const localesMap = loadLocalesMapFromDir(
  /\.\/langs\/([^/]+)\/(.*)\.json$/,
  modules,
);

/**
 * 加载应用特有的语言包
 * 这里也可以改造为从服务端获取翻译数据
 * 
 * @param lang - 语言代码
 * @returns 返回应用语言包对象
 * 
 * @example
 * // 可以扩展为从 API 加载
 * async function loadMessages(lang) {
 *   const [appLocaleMessages, serverMessages] = await Promise.all([
 *     localesMap[lang]?.(),
 *     fetch(`/api/locales/${lang}`).then(r => r.json())
 *   ]);
 *   return { ...appLocaleMessages?.default, ...serverMessages };
 * }
 */
async function loadMessages(lang: SupportedLanguagesType) {
  // 并行加载应用语言包和第三方组件库语言包
  const [appLocaleMessages] = await Promise.all([
    localesMap[lang]?.(),
    loadThirdPartyMessage(lang),
  ]);
  return appLocaleMessages?.default;
}

/**
 * 加载第三方组件库的语言包
 * 包括 Element Plus 和 Dayjs 的语言包
 * 
 * @param lang - 语言代码
 */
async function loadThirdPartyMessage(lang: SupportedLanguagesType) {
  await Promise.all([loadElementLocale(lang), loadDayjsLocale(lang)]);
}

/**
 * 加载 dayjs 的语言包
 * dayjs 用于日期时间格式化，需要设置语言包以支持本地化
 * 
 * @param lang - 语言代码
 * 
 * @example
 * // 使用示例
 * import dayjs from 'dayjs';
 * 
 * // 加载中文语言包后
 * dayjs.locale('zh-cn');
 * dayjs().format('YYYY年MM月DD日'); // 2024年01月01日
 * 
 * // 加载英文语言包后
 * dayjs.locale('en');
 * dayjs().format('MMMM DD, YYYY'); // January 01, 2024
 */
async function loadDayjsLocale(lang: SupportedLanguagesType) {
  let locale;
  switch (lang) {
    case 'en-US': {
      // 动态导入英文语言包
      locale = await import('dayjs/locale/en');
      break;
    }
    case 'zh-CN': {
      // 动态导入中文语言包
      locale = await import('dayjs/locale/zh-cn');
      break;
    }
    // 默认使用英语
    default: {
      locale = await import('dayjs/locale/en');
    }
  }
  if (locale) {
    // 设置 dayjs 的全局语言
    dayjs.locale(locale);
  } else {
    console.error(`Failed to load dayjs locale for ${lang}`);
  }
}

/**
 * 加载 element-plus 的语言包
 * Element Plus 组件库需要语言包来显示本地化的文本
 * 
 * @param lang - 语言代码
 * 
 * @example
 * // 在 Element Plus 配置中使用
 * import { createApp } from 'vue';
 * import ElementPlus from 'element-plus';
 * import { elementLocale } from '#/locales';
 * 
 * const app = createApp(App);
 * app.use(ElementPlus, {
 *   locale: elementLocale.value  // 使用响应式语言包
 * });
 * 
 * // 语言切换时，elementLocale.value 会自动更新
 * // Element Plus 组件会自动使用新的语言包
 */
async function loadElementLocale(lang: SupportedLanguagesType) {
  switch (lang) {
    case 'en-US': {
      // 切换到英文语言包
      elementLocale.value = enLocale;
      break;
    }
    case 'zh-CN': {
      // 切换到中文语言包
      elementLocale.value = defaultLocale;
      break;
    }
  }
}

/**
 * 设置国际化系统（应用层）
 * 这是应用层国际化的入口函数
 * 
 * @param app - Vue 应用实例
 * @param options - 配置选项
 * 
 * @example
 * import { setupI18n } from '#/locales';
 * 
 * const app = createApp(App);
 * await setupI18n(app);
 */
async function setupI18n(app: App, options: LocaleSetupOptions = {}) {
  // 调用核心 setupI18n，传入应用层配置
  await coreSetup(app, {
    // 从偏好设置中获取默认语言
    defaultLocale: preferences.app.locale,
    // 传入加载消息的函数
    loadMessages,
    // 开发环境启用缺失键值警告
    missingWarn: !import.meta.env.PROD,
    // 允许外部覆盖配置
    ...options,
  });
}

// 重新导出 $t 和 loadLocaleMessages（从 i18n.ts）
export { $t, loadLocaleMessages } from './i18n';

// 导出 elementLocale，用于 Element Plus 配置
// 导出 setupI18n，用于应用初始化
export { elementLocale, setupI18n };

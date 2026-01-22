import type { App } from 'vue';
import type { Locale } from 'vue-i18n';

import type {
  ImportLocaleFn,
  LoadMessageFn,
  LocaleSetupOptions,
  SupportedLanguagesType,
} from './typing';

import { unref } from 'vue';
import { createI18n } from 'vue-i18n';

import { useSimpleLocale } from '#/shared/composables/use-simple-locale';
/**
 * 创建 i18n 实例
 * - globalInjection: true - 启用全局注入，可以在模板中直接使用 $t
 * - legacy: false - 使用 Composition API 模式
 * - locale: '' - 初始语言为空，将在 setupI18n 中设置
 * - messages: {} - 初始消息为空，将动态加载
 */
const i18n = createI18n({
  globalInjection: true,
  legacy: false,
  locale: '',
  messages: {},
});

/**
 * 使用 Vite 的 glob 导入功能，扫描 langs 目录下的所有 JSON 文件
 * 这会生成一个对象，key 是文件路径，value 是异步导入函数
 */
const modules = import.meta.glob('./langs/**/*.json');

/**
 * 使用简单国际化 composable
 * 用于一些不需要完整 i18n 功能的场景
 */
const { setSimpleLocale } = useSimpleLocale();

/**
 * 从目录结构加载语言包映射
 * 使用正则表达式解析文件路径，提取语言代码和文件名
 * 
 * @param regexp - 正则表达式，用于匹配文件路径
 * @param modules - Vite glob 导入生成的模块对象
 * @returns 返回语言代码到导入函数的映射
 */
const localesMap = loadLocalesMapFromDir(
  /\.\/langs\/([^/]+)\/(.*)\.json$/,
  modules,
);

/**
 * 用于存储加载额外消息的函数
 * 在 setupI18n 中设置，用于加载第三方组件库的语言包
 */
let loadMessages: LoadMessageFn;

/**
 * 加载语言包模块（简单模式）
 * 适用于扁平结构的语言包文件
 * 
 * @param modules - 模块对象，key 是文件路径，value 是导入函数
 * @returns 返回语言代码到导入函数的映射
 * 
 * @example
 * // 文件结构: ./langs/zh-CN.json, ./langs/en-US.json
 * const modules = import.meta.glob('./langs/*.json');
 * const map = loadLocalesMap(modules);
 */
function loadLocalesMap(modules: Record<string, () => Promise<unknown>>) {
  const localesMap: Record<Locale, ImportLocaleFn> = {};

  for (const [path, loadLocale] of Object.entries(modules)) {
    // 从路径中提取语言代码
    // 例如: ./langs/zh-CN.json -> zh-CN
    const key = path.match(/([\w-]*)\.(json)/)?.[1];
    if (key) {
      localesMap[key] = loadLocale as ImportLocaleFn;
    }
  }
  return localesMap;
}

/**
 * 从目录结构加载语言包映射（目录模式）
 * 适用于按模块组织的语言包文件
 * 
 * @param regexp - 正则表达式，用于匹配文件路径
 *                例如: /\.\/langs\/([^/]+)\/(.*)\.json$/
 *                匹配: ./langs/zh-CN/common.json
 *                提取: 语言代码 = zh-CN, 文件名 = common
 * @param modules - Vite glob 导入生成的模块对象
 * @returns 返回语言代码到导入函数的映射
 * 
 * @example
 * // 文件结构:
 * // ./langs/zh-CN/common.json
 * // ./langs/zh-CN/ui.json
 * // ./langs/en-US/common.json
 * // ./langs/en-US/ui.json
 * 
 * const modules = import.meta.glob('./langs/##/*.json');
 * const map = loadLocalesMapFromDir(
 *   /\.\/langs\/([^/]+)\/(.*)\.json$/,
 *   modules
 * );
 * // 结果:
 * // {
 * //   'zh-CN': async () => ({ default: { common: {...}, ui: {...} } }),
 * //   'en-US': async () => ({ default: { common: {...}, ui: {...} } })
 * // }
 */
function loadLocalesMapFromDir(
  regexp: RegExp,
  modules: Record<string, () => Promise<unknown>>,
): Record<Locale, ImportLocaleFn> {
  // 第一步：按语言组织文件
  const localesRaw: Record<Locale, Record<string, () => Promise<unknown>>> = {};
  const localesMap: Record<Locale, ImportLocaleFn> = {};

  // 遍历所有模块，使用正则表达式提取语言代码和文件名
  for (const path in modules) {
    const match = path.match(regexp);
    if (match) {
      const [_, locale, fileName] = match;
      if (locale && fileName) {
        // 按语言代码组织文件
        if (!localesRaw[locale]) {
          localesRaw[locale] = {};
        }
        if (modules[path]) {
          localesRaw[locale][fileName] = modules[path];
        }
      }
    }
  }
  // 第二步：为每种语言创建异步导入函数
  for (const [locale, files] of Object.entries(localesRaw)) {
    localesMap[locale] = async () => {
      const messages: Record<string, any> = {};
      // 并行加载该语言下的所有文件
      for (const [fileName, importFn] of Object.entries(files)) {
        messages[fileName] = ((await importFn()) as any)?.default;
      }
      // 返回格式化的消息对象
      return { default: messages };
    };
  }

  return localesMap;
}

/**
 * 设置 i18n 语言
 * 更新 vue-i18n 的语言设置，并同步更新 HTML 标签的 lang 属性
 * 
 * @param locale - 语言代码
 */
function setI18nLanguage(locale: Locale) {
  // 更新 vue-i18n 的语言
  i18n.global.locale.value = locale;

  // 更新 HTML 标签的 lang 属性，用于 SEO 和屏幕阅读器
  document?.querySelector('html')?.setAttribute('lang', locale);
}

/**
 * 设置国际化系统
 * 这是国际化的入口函数，需要在应用启动时调用
 * 
 * @param app - Vue 应用实例
 * @param options - 配置选项
 * 
 * @example
 * import { setupI18n } from '#/locales';
 * 
 * const app = createApp(App);
 * await setupI18n(app, {
 *   defaultLocale: 'zh-CN',
 *   loadMessages: async (lang) => {
 *     // 加载额外的语言包
 *     return await loadThirdPartyMessages(lang);
 *   },
 *   missingWarn: true
 * });
 */
async function setupI18n(app: App, options: LocaleSetupOptions = {}) {
  const { defaultLocale = 'zh-CN' } = options;
  debugger
  // 设置加载额外消息的函数
  // 可以用于加载第三方组件库的语言包（如 Element Plus、Dayjs）
  loadMessages = options.loadMessages || (async () => ({}));
  
  // 将 i18n 插件安装到 Vue 应用
  app.use(i18n);
  
  // 加载默认语言的语言包
  await loadLocaleMessages(defaultLocale);

  // 设置缺失键值的处理函数
  // 在开发环境可以打印警告，帮助发现缺失的翻译
  i18n.global.setMissingHandler((locale, key) => {
    if (options.missingWarn && key.includes('.')) {
      console.warn(
        `[intlify] Not found '${key}' key in '${locale}' locale messages.`,
      );
    }
  });
}

/**
 * 加载语言包消息
 * 这是语言切换的核心函数
 * 
 * @param lang - 语言代码
 * 
 * @example
 * // 切换到英文
 * await loadLocaleMessages('en-US');
 * 
 * // 切换到中文
 * await loadLocaleMessages('zh-CN');
 */
async function loadLocaleMessages(lang: SupportedLanguagesType) {
  // 如果已经是目标语言，直接设置语言（不重新加载）
  if (unref(i18n.global.locale) === lang) {
    return setI18nLanguage(lang);
  }
  
  // 更新简单国际化的语言
  setSimpleLocale(lang);

  // 加载应用语言包
  const message = await localesMap[lang]?.();

  if (message?.default) {
    // 设置语言包消息
    i18n.global.setLocaleMessage(lang, message.default);
  }

  // 加载额外的消息（如第三方组件库的语言包）
  const mergeMessage = await loadMessages(lang);
  if (mergeMessage) {
    // 合并到现有语言包中
    i18n.global.mergeLocaleMessage(lang, mergeMessage);
  }

  // 设置语言
  return setI18nLanguage(lang);
}

/**
 * 全局翻译函数
 * 从 i18n 实例中提取的翻译函数，可以在任何地方使用
 */
const $t = i18n.global.t;

export {
  $t,
  i18n,
  loadLocaleMessages,
  loadLocalesMap,
  loadLocalesMapFromDir,
  setupI18n,
};

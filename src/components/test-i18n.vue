<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { $t, loadLocaleMessages } from '#/locales';
import type { SupportedLanguagesType } from '#/locales/typing';

/**
 * 使用 vue-i18n 的 useI18n composable
 * 这是推荐的 Composition API 使用方式
 */
const { t, locale } = useI18n();


/**
 * 当前语言
 */
const currentLang = ref<SupportedLanguagesType>(locale.value as SupportedLanguagesType);

/**
 * 支持的语言列表
 */
const languages: { label: string; value: SupportedLanguagesType }[] = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
];

/**
 * 切换语言
 * @param lang - 目标语言代码
 */
async function switchLanguage(lang: SupportedLanguagesType) {
  await loadLocaleMessages(lang);
  currentLang.value = lang;
}

/**
 * 测试数据 - 展示不同模块的翻译
 */
const testCases = {
  // 通用翻译
  common: [
    'common.login',
    'common.logout',
    'common.confirm',
    'common.cancel',
    'common.reset',
    'common.edit',
    'common.delete',
    'common.create',
  ],
  // UI 翻译
  ui: [
    'ui.formRules.required',
    'ui.actionTitle.edit',
    'ui.actionMessage.deleteConfirm',
    'ui.placeholder.input',
    'ui.fallback.pageNotFound',
  ],
  // 认证翻译
  authentication: [
    'authentication.welcomeBack',
    'authentication.loginSuccess',
    'authentication.username',
    'authentication.password',
    'authentication.rememberMe',
  ],
  // 偏好设置翻译
  preferences: [
    'preferences.title',
    'preferences.appearance',
    'preferences.layout',
    'preferences.language',
    'preferences.theme.title',
  ],
};

/**
 * 测试带参数的翻译
 */
const testWithParams = [
  {
    key: 'ui.formRules.required',
    params: ['用户名'],
  },
  {
    key: 'ui.actionTitle.edit',
    params: ['用户'],
  },
  {
    key: 'ui.actionMessage.deleteConfirm',
    params: ['用户数据'],
  },
  {
    key: 'authentication.codeTip',
    params: ['6'],
  },
];

/**
 * Element Plus 分页组件测试数据
 */
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 100,
});

/**
 * 处理分页变化
 */
function handlePageChange(page: number) {
  pagination.value.currentPage = page;
  console.log('当前页:', page);
}

/**
 * 处理每页条数变化
 */
function handleSizeChange(size: number) {
  pagination.value.pageSize = size;
  pagination.value.currentPage = 1; // 重置到第一页
  console.log('每页条数:', size);
}
</script>

<template>
  <div class="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-8">
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- 标题 -->
      <div class="text-center space-y-2">
        <h1 class="text-4xl font-bold">{{ $t('common.login') }} - 国际化测试</h1>
        <p class="text-muted-foreground">
          当前语言: {{ currentLang }} ({{ locale }})
        </p>
      </div>

      <!-- 语言切换器 -->
      <div class="card p-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 class="text-2xl font-semibold mb-4">语言切换</h2>
        <div class="flex gap-4">
          <button
            v-for="lang in languages"
            :key="lang.value"
            @click="switchLanguage(lang.value)"
            :class="[
              'px-4 py-2 rounded-md transition-colors',
              currentLang === lang.value
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/80',
            ]"
          >
            {{ lang.label }}
          </button>
        </div>
        <p class="mt-4 text-sm text-muted-foreground">
          切换语言后，所有翻译文本会自动更新
        </p>
      </div>

      <!-- 使用 $t 函数 -->
      <div class="card p-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 class="text-2xl font-semibold mb-4">使用 $t 函数（全局函数）</h2>
        <div class="space-y-2">
          <div class="flex items-center gap-4">
            <code class="text-sm bg-muted px-2 py-1 rounded">$t('common.login')</code>
            <span class="text-lg">{{ $t('common.login') }}</span>
          </div>
          <div class="flex items-center gap-4">
            <code class="text-sm bg-muted px-2 py-1 rounded">$t('common.confirm')</code>
            <span class="text-lg">{{ $t('common.confirm') }}</span>
          </div>
          <div class="flex items-center gap-4">
            <code class="text-sm bg-muted px-2 py-1 rounded">$t('ui.fallback.pageNotFound')</code>
            <span class="text-lg">{{ $t('ui.fallback.pageNotFound') }}</span>
          </div>
        </div>
      </div>

      <!-- 使用 useI18n 的 t 函数 -->
      <div class="card p-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 class="text-2xl font-semibold mb-4">使用 useI18n().t 函数（Composition API）</h2>
        <div class="space-y-2">
          <div class="flex items-center gap-4">
            <code class="text-sm bg-muted px-2 py-1 rounded">t('common.logout')</code>
            <span class="text-lg">{{ t('common.logout') }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm bg-muted px-2 py-1 rounded">t('common.reset')</span>
            <span class="text-lg">{{ t('common.reset') }}</span>
          </div>
          <div class="flex items-center gap-4">
            <code class="text-sm bg-muted px-2 py-1 rounded">t('authentication.welcomeBack')</code>
            <span class="text-lg">{{ t('authentication.welcomeBack') }}</span>
          </div>
        </div>
      </div>

      <!-- 通用翻译模块 -->
      <div class="card p-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 class="text-2xl font-semibold mb-4">通用翻译 (common)</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="key in testCases.common"
            :key="key"
            class="p-4 rounded-lg bg-[hsl(var(--muted))]"
          >
            <div class="text-xs text-muted-foreground mb-1">{{ key }}</div>
            <div class="font-medium">{{ $t(key) }}</div>
          </div>
        </div>
      </div>

      <!-- UI 翻译模块 -->
      <div class="card p-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 class="text-2xl font-semibold mb-4">UI 翻译 (ui)</h2>
        <div class="space-y-3">
          <div
            v-for="key in testCases.ui"
            :key="key"
            class="p-4 rounded-lg bg-[hsl(var(--muted))]"
          >
            <div class="text-xs text-muted-foreground mb-1">{{ key }}</div>
            <div class="font-medium">{{ $t(key) }}</div>
          </div>
        </div>
      </div>

      <!-- 认证翻译模块 -->
      <div class="card p-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 class="text-2xl font-semibold mb-4">认证翻译 (authentication)</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="key in testCases.authentication"
            :key="key"
            class="p-4 rounded-lg bg-[hsl(var(--muted))]"
          >
            <div class="text-xs text-muted-foreground mb-1">{{ key }}</div>
            <div class="font-medium">{{ $t(key) }}</div>
          </div>
        </div>
      </div>

      <!-- 偏好设置翻译模块 -->
      <div class="card p-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 class="text-2xl font-semibold mb-4">偏好设置翻译 (preferences)</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="key in testCases.preferences"
            :key="key"
            class="p-4 rounded-lg bg-[hsl(var(--muted))]"
          >
            <div class="text-xs text-muted-foreground mb-1">{{ key }}</div>
            <div class="font-medium">{{ $t(key) }}</div>
          </div>
        </div>
      </div>

      <!-- 带参数的翻译 -->
      <div class="card p-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 class="text-2xl font-semibold mb-4">带参数的翻译</h2>
        <div class="space-y-3">
          <div
            v-for="(item, index) in testWithParams"
            :key="index"
            class="p-4 rounded-lg bg-[hsl(var(--muted))]"
          >
            <div class="text-xs text-muted-foreground mb-1">
              {{ item.key }} ({{ item.params.join(', ') }})
            </div>
            <div class="font-medium">
              {{ $t(item.key, item.params) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 实际使用示例 -->
      <div class="card p-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 class="text-2xl font-semibold mb-4">实际使用示例</h2>
        <div class="space-y-4">
          <!-- 按钮示例 -->
          <div class="flex gap-4">
            <button
              class="px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90"
            >
              {{ $t('common.confirm') }}
            </button>
            <button
              class="px-4 py-2 rounded-md bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:opacity-90"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              class="px-4 py-2 rounded-md bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:opacity-90"
            >
              {{ $t('common.delete') }}
            </button>
          </div>

          <!-- 表单示例 -->
          <div class="space-y-2">
            <label class="block text-sm font-medium">
              {{ $t('authentication.username') }}
            </label>
            <input
              type="text"
              :placeholder="$t('ui.placeholder.input')"
              class="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))]"
            />
          </div>

          <!-- 提示信息示例 -->
          <div class="p-4 rounded-lg bg-[hsl(var(--muted))]">
            <p class="text-sm">
              {{ $t('ui.actionMessage.deleteConfirm', ['用户数据']) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Element Plus 分页组件国际化测试 -->
      <div class="card p-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 class="text-2xl font-semibold mb-4">Element Plus 分页组件国际化测试</h2>
        <div class="space-y-4">
          <p class="text-sm text-muted-foreground">
            切换语言后，分页组件的文本（如"共 X 条"、"每页显示"、"条/页"等）会自动更新
          </p>
          
          <!-- 基础分页 -->
          <div class="space-y-2">
            <h3 class="font-semibold">基础分页</h3>
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
            />
          </div>

          <!-- 完整功能分页 -->
          <div class="space-y-2">
            <h3 class="font-semibold">完整功能分页（带总数和跳转）</h3>
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              background
            />
          </div>

          <!-- 简单分页 -->
          <div class="space-y-2">
            <h3 class="font-semibold">简单分页</h3>
            <el-pagination
              v-model:current-page="pagination.currentPage"
              :total="pagination.total"
              :page-size="pagination.pageSize"
              layout="prev, pager, next"
            />
          </div>

          <!-- 分页信息显示 -->
          <div class="p-4 rounded-lg bg-[hsl(var(--muted))]">
            <div class="text-sm space-y-1">
              <div>当前页: {{ pagination.currentPage }}</div>
              <div>每页条数: {{ pagination.pageSize }}</div>
              <div>总条数: {{ pagination.total }}</div>
              <div>总页数: {{ Math.ceil(pagination.total / pagination.pageSize) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 代码示例 -->
      <div class="card p-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 class="text-2xl font-semibold mb-4">代码示例</h2>
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold mb-2">1. 在模板中使用 $t</h3>
            <pre class="p-4 rounded-lg bg-[hsl(var(--muted))] text-sm overflow-x-auto"><code>&lt;template&gt;
  &lt;div&gt;{{ $t('common.login') }}&lt;/div&gt;
&lt;/template&gt;</code></pre>
          </div>

          <div>
            <h3 class="font-semibold mb-2">2. 在脚本中使用 useI18n</h3>
            <pre class="p-4 rounded-lg bg-[hsl(var(--muted))] text-sm overflow-x-auto"><code>&lt;script setup lang="ts"&gt;
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const message = t('common.login');
&lt;/script&gt;</code></pre>
          </div>

          <div>
            <h3 class="font-semibold mb-2">3. 使用全局 $t 函数</h3>
            <pre class="p-4 rounded-lg bg-[hsl(var(--muted))] text-sm overflow-x-auto"><code>import { $t } from '#/locales';

const message = $t('common.login');</code></pre>
          </div>

          <div>
            <h3 class="font-semibold mb-2">4. 带参数的翻译</h3>
            <pre class="p-4 rounded-lg bg-[hsl(var(--muted))] text-sm overflow-x-auto"><code>// 模板中
{{ $t('ui.formRules.required', ['用户名']) }}

// 脚本中
const message = t('ui.formRules.required', ['用户名']);</code></pre>
          </div>

          <div>
            <h3 class="font-semibold mb-2">5. 切换语言</h3>
            <pre class="p-4 rounded-lg bg-[hsl(var(--muted))] text-sm overflow-x-auto"><code>import { loadLocaleMessages } from '#/locales/i18n';

// 切换到英文
await loadLocaleMessages('en-US');

// 切换到中文
await loadLocaleMessages('zh-CN');</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

code {
  font-family: 'Courier New', monospace;
}
</style>

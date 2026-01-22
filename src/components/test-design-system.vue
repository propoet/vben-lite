<script setup lang="ts">
import { computed } from 'vue'
import { usePreferences } from '#/preferences'
import { preferencesManager } from '#/preferences'
import { BUILT_IN_THEME_PRESETS } from '#/preferences/constants'
import type { BuiltinThemeType, ThemeModeType } from '#/preferences/types'

const { isDark, theme: currentTheme, preferences } = usePreferences()

// 主题模式选项
const themeModes: { label: string; value: ThemeModeType }[] = [
  { label: '亮色', value: 'light' },
  { label: '暗色', value: 'dark' },
  { label: '自动', value: 'auto' }
]

// 内置主题选项
const builtinThemes = computed(() => {
  return BUILT_IN_THEME_PRESETS.map((preset) => ({
    label: preset.type === 'default' ? '默认' : preset.type,
    value: preset.type
  }))
})

// 切换主题模式
const toggleThemeMode = (mode: ThemeModeType) => {
  preferencesManager.updatePreferences({
    theme: { mode }
  })
}

// 切换内置主题
const toggleBuiltinTheme = (themeType: BuiltinThemeType) => {
  // 找到对应的主题预设
  const theme = BUILT_IN_THEME_PRESETS.find((item) => item.type === themeType)
  
  // 如果找到主题，自动同步 colorPrimary（类似 builtin.vue 的实现）
  if (theme) {
    // 根据当前是否为暗色模式，获取对应的颜色
    const primaryColor = isDark.value
      ? theme.darkPrimaryColor || theme.primaryColor
      : theme.primaryColor
    
    // 获取最终使用的颜色（优先使用 primaryColor，否则使用 color）
    const colorPrimaryToUse = primaryColor || theme.color
    
    // 如果主题不是 custom，或者有颜色值，则同时更新 builtinType 和 colorPrimary
    if (themeType !== 'custom' || colorPrimaryToUse) {
      preferencesManager.updatePreferences({
        theme: {
          builtinType: themeType,
          // 自动同步内置主题颜色到 colorPrimary
          colorPrimary: colorPrimaryToUse
        }
      })
    } else {
      // custom 主题且没有颜色时，只更新 builtinType
      preferencesManager.updatePreferences({
        theme: { builtinType: themeType }
      })
    }
    // preferencesManager.updatePreferences({
    //     theme: { builtinType: themeType }
    //   })
  } else {
    // 如果找不到主题，只更新 builtinType
    preferencesManager.updatePreferences({
      theme: { builtinType: themeType }
    })
  }
}

// 更新圆角
const updateRadius = (radius: string) => {
  preferencesManager.updatePreferences({
    theme: { radius }
  })
}

// 更新字体大小
const updateFontSize = (fontSize: number) => {
  preferencesManager.updatePreferences({
    theme: { fontSize }
  })
}

// 颜色变量列表
const colorVariables = [
  { name: 'Primary', var: '--primary', description: '主题色' },
  { name: 'Success', var: '--success', description: '成功色' },
  { name: 'Warning', var: '--warning', description: '警告色' },
  { name: 'Destructive', var: '--destructive', description: '危险色' },
  { name: 'Background', var: '--background', description: '背景色' },
  { name: 'Foreground', var: '--foreground', description: '前景色' },
  { name: 'Card', var: '--card', description: '卡片背景' },
  { name: 'Card Foreground', var: '--card-foreground', description: '卡片前景' },
  { name: 'Border', var: '--border', description: '边框色' },
  { name: 'Input', var: '--input', description: '输入框边框' },
  { name: 'Muted', var: '--muted', description: '静音背景' },
  { name: 'Accent', var: '--accent', description: '强调色' }
]
</script>

<template>
  <div class="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-8">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- 标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-2">设计系统测试</h1>
        <p class="text-[hsl(var(--muted-foreground))]">CSS变量与设计系统集成测试示例</p>
      </div>

      <!-- 主题切换区域 -->
      <section class="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[var(--radius)] p-6">
        <h2 class="text-2xl font-semibold mb-4">主题切换</h2>
        <div class="space-y-4">
          <!-- 主题模式切换 -->
          <div>
            <h3 class="text-lg font-medium mb-2">主题模式</h3>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="mode in themeModes"
                :key="mode.value"
                @click="toggleThemeMode(mode.value)"
                :class="[
                  'px-4 py-2 rounded-[var(--radius)] transition-colors',
                  preferences.theme.mode === mode.value
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--accent))]'
                ]"
              >
                {{ mode.label }}
              </button>
            </div>
            <p class="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              当前模式: {{ preferences.theme.mode }} | 实际主题: {{ currentTheme }}
            </p>
          </div>

          <!-- 内置主题切换 -->
          <div>
            <h3 class="text-lg font-medium mb-2">内置主题</h3>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="theme in builtinThemes"
                :key="theme.value"
                @click="toggleBuiltinTheme(theme.value)"
                :class="[
                  'px-4 py-2 rounded-[var(--radius)] transition-colors',
                  preferences.theme.builtinType === theme.value
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--accent))]'
                ]"
              >
                {{ theme.label }}
              </button>
            </div>
            <p class="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              当前主题: {{ preferences.theme.builtinType }}
            </p>
          </div>
        </div>
      </section>

      <!-- 颜色系统测试 -->
      <section class="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[var(--radius)] p-6">
        <h2 class="text-2xl font-semibold mb-4">颜色系统</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="color in colorVariables"
            :key="color.var"
            class="p-4 rounded-[var(--radius)] border border-[hsl(var(--border))]"
            :style="{ backgroundColor: `hsl(var(${color.var}))` }"
          >
            <div
              class="text-sm font-medium mb-1"
              :style="{ color: `hsl(var(${color.var === '--background' || color.var === '--card' ? '--foreground' : color.var + '-foreground'}))` }"
            >
              {{ color.name }}
            </div>
            <div
              class="text-xs opacity-80"
              :style="{ color: `hsl(var(${color.var === '--background' || color.var === '--card' ? '--foreground' : color.var + '-foreground'}))` }"
            >
              {{ color.description }}
            </div>
            <div
              class="text-xs mt-2 font-mono"
              :style="{ color: `hsl(var(${color.var === '--background' || color.var === '--card' ? '--foreground' : color.var + '-foreground'}))` }"
            >
              {{ color.var }}
            </div>
          </div>
        </div>
      </section>

      <!-- 按钮示例 -->
      <section class="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[var(--radius)] p-6">
        <h2 class="text-2xl font-semibold mb-4">按钮示例</h2>
        <div class="flex flex-wrap gap-4">
          <button
            class="px-4 py-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
          >
            主要按钮
          </button>
          <button
            class="px-4 py-2 rounded-[var(--radius)] bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            次要按钮
          </button>
          <button
            class="px-4 py-2 rounded-[var(--radius)] bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] hover:opacity-90 transition-opacity"
          >
            成功按钮
          </button>
          <button
            class="px-4 py-2 rounded-[var(--radius)] bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] hover:opacity-90 transition-opacity"
          >
            警告按钮
          </button>
          <button
            class="px-4 py-2 rounded-[var(--radius)] bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:opacity-90 transition-opacity"
          >
            危险按钮
          </button>
          <button
            class="px-4 py-2 rounded-[var(--radius)] border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            边框按钮
          </button>
        </div>
      </section>

      <!-- 卡片示例 -->
      <section class="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[var(--radius)] p-6">
        <h2 class="text-2xl font-semibold mb-4">卡片示例</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="i in 3"
            :key="i"
            class="p-6 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
          >
            <h3 class="text-lg font-semibold mb-2">卡片 {{ i }}</h3>
            <p class="text-[hsl(var(--card-foreground))] text-sm">
              这是一个使用设计系统变量的卡片示例，展示了背景色、边框色和圆角的使用。
            </p>
          </div>
        </div>
      </section>

      <!-- 输入框示例 -->
      <section class="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[var(--radius)] p-6">
        <h2 class="text-2xl font-semibold mb-4">输入框示例</h2>
        <div class="space-y-4 max-w-md">
          <div>
            <label class="block text-sm font-medium mb-2">文本输入</label>
            <input
              type="text"
              placeholder="请输入内容"
              class="w-full px-4 py-2 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--input-background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--input-placeholder))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">文本域</label>
            <textarea
              placeholder="请输入多行内容"
              rows="4"
              class="w-full px-4 py-2 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--input-background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--input-placeholder))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            ></textarea>
          </div>
        </div>
      </section>

      <!-- 圆角和字体大小控制 -->
      <section class="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[var(--radius)] p-6">
        <h2 class="text-2xl font-semibold mb-4">设计Token控制</h2>
        <div class="space-y-6">
          <!-- 圆角控制 -->
          <div>
            <h3 class="text-lg font-medium mb-2">圆角 (--radius)</h3>
            <div class="flex gap-2 flex-wrap mb-4">
              <button
                v-for="radius in ['0', '0.25', '0.5', '0.75', '1']"
                :key="radius"
                @click="updateRadius(radius)"
                :class="[
                  'px-4 py-2 rounded-[var(--radius)] transition-colors',
                  preferences.theme.radius === radius 
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--accent))]'
                ]"
              >
                {{ radius }}rem
              </button>
            </div>
            <div class="flex gap-4 items-center">
              <div
                class="w-20 h-20 bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))] text-sm"
                :style="{ borderRadius: `var(--radius)` }"
              >
                圆角示例
              </div>
              <p class="text-sm text-[hsl(var(--muted-foreground))]">
                当前圆角: {{ preferences.theme.radius }}
              </p>
            </div>
          </div>

          <!-- 字体大小控制 -->
          <div>
            <h3 class="text-lg font-medium mb-2">字体大小 (--font-size-base)</h3>
            <div class="flex gap-2 flex-wrap mb-4">
              <button
                v-for="size in [12, 14, 16, 18, 20]"
                :key="size"
                @click="updateFontSize(size)"
                :class="[
                  'px-4 py-2 rounded-[var(--radius)] transition-colors',
                  preferences.theme.fontSize === size
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--accent))]'
                ]"
              >
                {{ size }}px
              </button>
            </div>
            <p
              class="text-[hsl(var(--muted-foreground))]"
              :style="{ fontSize: `var(--font-size-base)` }"
            >
              当前字体大小示例文本 ({{ preferences.theme.fontSize }}px)
            </p>
          </div>
        </div>
      </section>

      <!-- 状态展示 -->
      <section class="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[var(--radius)] p-6">
        <h2 class="text-2xl font-semibold mb-4">当前状态</h2>
        <div class="space-y-2 text-sm font-mono bg-[hsl(var(--muted))] p-4 rounded-[var(--radius)]">
          <div>
            <span class="text-[hsl(var(--muted-foreground))]">主题模式:</span>
            <span class="ml-2">{{ preferences.theme.mode }}</span>
          </div>
          <div>
            <span class="text-[hsl(var(--muted-foreground))]">内置主题:</span>
            <span class="ml-2">{{ preferences.theme.builtinType }}</span>
          </div>
          <div>
            <span class="text-[hsl(var(--muted-foreground))]">实际主题:</span>
            <span class="ml-2">{{ currentTheme }}</span>
          </div>
          <div>
            <span class="text-[hsl(var(--muted-foreground))]">是否暗色:</span>
            <span class="ml-2">{{ isDark ? '是' : '否' }}</span>
          </div>
          <div>
            <span class="text-[hsl(var(--muted-foreground))]">圆角:</span>
            <span class="ml-2">{{ preferences.theme.radius }}</span>
          </div>
          <div>
            <span class="text-[hsl(var(--muted-foreground))]">字体大小:</span>
            <span class="ml-2">{{ preferences.theme.fontSize }}px</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped></style>

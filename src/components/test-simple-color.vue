<script setup lang="ts">
import { usePreferences } from '#/preferences'

const { isDark, theme: currentTheme } = usePreferences()
</script>

<template>
  <div class="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-8">
    <div class="max-w-4xl mx-auto space-y-6">
      <h1 class="text-3xl font-bold">简单颜色测试</h1>

      <!-- 主要颜色展示 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
          Primary
        </div>
        <div class="p-4 rounded-lg bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">
          Success
        </div>
        <div class="p-4 rounded-lg bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]">
          Warning
        </div>
        <div
          class="p-4 rounded-lg bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]"
        >
          Destructive
        </div>
      </div>

      <!-- 背景和前景色 -->
      <div class="p-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 class="text-xl font-semibold mb-2">卡片示例</h2>
        <p class="text-[hsl(var(--card-foreground))]">
          这是一个使用CSS变量的卡片，背景色和文字颜色会根据主题自动调整。
        </p>
      </div>

      <!-- 状态信息 -->
      <div class="p-4 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
        <p>当前主题: {{ currentTheme }}</p>
        <p>是否暗色: {{ isDark ? '是' : '否' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

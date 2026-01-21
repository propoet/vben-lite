<script setup lang="ts">
  import { usePreferences } from '#/preferences'
  const { isDark, theme: currentTheme, preferences, } = usePreferences();
// import { useDark, useToggle } from '@vueuse/core'

// import TestElementVisibleRect from '#/components/TestElementVisibleRect.vue'

// const isDark = useDark({
//   storageKey: 'theme'
// })

// const toggleDark = useToggle(isDark)
</script>

<template>
    <div
    class="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
  >
  <span class="text-[hsl(var(--primary))]">11</span>
    <!-- 你的应用内容 -->
    <h1 class="text-2xl font-bold">Vben Lite</h1>
    <p>当前主题: {{ currentTheme }}</p>
    <p>是否暗色: {{ isDark }}</p>
  </div>
  <!-- <div class="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white p-4"> -->
    <!-- <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Vben Lite</h1>
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        @click="toggleDark()"
      >
        切换主题: {{ isDark ? '🌙 暗色' : '☀️ 亮色' }}
      </button>
    </div> -->

    <!-- getElementVisibleRect 测试组件 -->
    <!-- <TestElementVisibleRect /> -->
  <!-- </div> -->
</template>

<style scoped></style>

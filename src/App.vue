<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import TestI18n from './components/test-i18n.vue'

// 在组件中测试
import { $t, elementLocale } from '#/locales'
import dayjs from 'dayjs'
console.log(dayjs().format('YYYY年MM月DD日'))

console.log($t('common.login'))
</script>

<template>
  <!-- Element Plus 配置提供者，使用响应式语言包 -->
  <!-- 当 elementLocale 更新时，所有 Element Plus 组件会自动切换语言 -->
  <ElConfigProvider :locale="elementLocale">
    <!-- 国际化测试组件 -->
    <TestI18n />
    <!-- 其他测试组件（可选） -->
    <!-- <TestDesignSystem /> -->
    <!-- <TestSimpleColor /> -->
  </ElConfigProvider>
</template>

<style scoped></style>

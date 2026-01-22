<script setup lang="ts">
import TestI18n from './components/test-i18n.vue';

// 在组件中测试
import { $t } from '#/locales';
import dayjs from 'dayjs';
console.log(dayjs().format('YYYY年MM月DD日'));

console.log($t('common.login'));
</script>

<template>
  <!-- 国际化测试组件 -->
  <TestI18n />
  
  <!-- 其他测试组件（可选） -->
  <!-- <TestDesignSystem /> -->
  <!-- <TestSimpleColor /> -->
</template>

<style scoped></style>

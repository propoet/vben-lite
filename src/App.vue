<script setup lang="ts">

// 在组件中测试
import { $t } from '#/locales';
import dayjs from 'dayjs';
console.log(dayjs().format('YYYY年MM月DD日'));

console.log($t('common.login'));
</script>

<template>
  <TestDesignSystem />
  <TestSimpleColor />
</template>

<style scoped></style>

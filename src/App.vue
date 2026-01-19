<script setup lang="ts">
  import { useDark,useToggle } from '@vueuse/core';

  // const isDark = ref(false)
  // const toggleDark = () => {
  //   isDark.value = !isDark.value
  //   document.documentElement.classList.toggle('dark', isDark.value)
  // }
  const isDark = useDark({
  storageKey: 'theme',
})

const toggleDark = useToggle(isDark)

</script>

<template>
 <div
    class="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white p-4"
  >
    <h1 class="text-2xl font-bold">Vben Lite </h1>
    <button
      class="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      @click="toggleDark()"
    >
      切换主题: {{ isDark ? "暗色" : "亮色" }}
    </button>
  </div>
</template>

<style scoped></style>

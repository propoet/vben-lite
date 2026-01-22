import { createApp } from 'vue';
import './styles/index.css';
import App from './App.vue';
import { initPreferences } from './preferences';
import { setupI18n } from './locales';

/**
 * 应用初始化
 */
async function initApplication() {
  // 初始化偏好设置
  initPreferences({
    namespace: 'vben-lite',
    overrides: {
      theme: {
        mode: 'light',
      },
    },
  });

  // 创建 Vue 应用
  const app = createApp(App);

  // 设置国际化（必须在挂载前调用）
  await setupI18n(app);

  // 挂载应用
  app.mount('#app');
}

// 启动应用
initApplication();
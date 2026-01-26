// import { createApp } from 'vue';
// import './styles/index.css';
// import App from './App.vue';
import { initPreferences } from './preferences';
// import { setupI18n } from './locales';
/**
 * 应用初始化
 */
async function initApplication() {
    // 1. 确定命名空间
    const env = import.meta.env.PROD ? "prod" : "dev";
    const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";
    const appName = import.meta.env.VITE_APP_NAME || "vben-lite";
    const namespace = `${appName}-${appVersion}-${env}`;
  // 初始化偏好设置
  initPreferences({
    namespace,
    overrides: {
      theme: {
        mode: 'light',
      },
    },
  });
  const {bootstrap} = await import('./bootstrap');
  bootstrap(namespace)
}

// 启动应用
initApplication();



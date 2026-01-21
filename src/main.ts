import { createApp } from 'vue'
import './styles/index.css'
import App from './App.vue'
import { initPreferences } from './preferences'
// 初始化偏好设置
initPreferences({
  namespace: 'vben-lite',
  overrides: {
    // 可以在这里覆盖默认配置
    theme: {
      mode: 'light',
      // builtinType: 'pink',
      // radius: '0.1',
    },
  },
});

createApp(App).mount('#app')

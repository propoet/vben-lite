import { createApp } from "vue";
import App from './App.vue'
import { setupI18n } from "#/locales";
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '#/styles/index.css';

export async function bootstrap(namespace:string){
  console.log("namespace",namespace)
  const app = createApp(App)
  // 设置国际化
  await setupI18n(app)

  // 注册 Element Plus 插件
  // 注意：语言包配置通过 App.vue 中的 ElConfigProvider 提供，支持响应式更新
  app.use(ElementPlus);

  app.mount('#app')

}
# Vben 主题系统集成步骤

本文档提供将主题系统从示例项目集成到主项目的详细步骤。

## 📋 前置检查

在开始集成前，请确认：
- ✅ 项目已安装 Vue 3 + Vite
- ✅ Tailwind CSS 已配置
- ✅ 路径别名 `#/*` 已配置（在 `vite.config.ts` 和 `tsconfig.app.json` 中）

## 🚀 集成步骤

### 步骤 1: 安装缺失的依赖

在主项目根目录执行：

```bash
pnpm add clsx tailwind-merge
```

**说明：**
- `clsx`: 用于条件类名组合
- `tailwind-merge`: 用于合并 Tailwind 类名，避免冲突

**验证：**
```bash
pnpm list clsx tailwind-merge
```

---

### 步骤 2: 创建共享模块目录结构

在主项目 `src/` 目录下创建以下目录：

```bash
# Windows PowerShell
New-Item -ItemType Directory -Force -Path src/shared/cache, src/shared/color, src/shared/utils
```

**目录结构：**
```
src/
└── shared/
    ├── cache/          # 存储管理
    ├── color/          # 颜色工具
    └── utils/          # 工具函数
```

---

### 步骤 3: 复制共享模块文件

从 `example/theme-implementation/src/shared/` 复制以下文件到主项目：

#### 3.1 缓存模块
- ✅ `example/theme-implementation/src/shared/cache/storage-manager.ts` → `src/shared/cache/storage-manager.ts`
- ✅ `example/theme-implementation/src/shared/cache/index.ts` → `src/shared/cache/index.ts`

#### 3.2 颜色模块
- ✅ `example/theme-implementation/src/shared/color/convert.ts` → `src/shared/color/convert.ts`
- ✅ `example/theme-implementation/src/shared/color/color.ts` → `src/shared/color/color.ts`
- ✅ `example/theme-implementation/src/shared/color/generator.ts` → `src/shared/color/generator.ts`
- ✅ `example/theme-implementation/src/shared/color/index.ts` → `src/shared/color/index.ts`

#### 3.3 工具模块（18 个文件）
从 `example/theme-implementation/src/shared/utils/` 复制所有文件到 `src/shared/utils/`：

- ✅ `cn.ts` - 类名合并工具
- ✅ `date.ts` - 日期工具
- ✅ `diff.ts` - 对象差异比较
- ✅ `dom.ts` - DOM 工具
- ✅ `download.ts` - 下载工具
- ✅ `inference.ts` - 类型推断工具
- ✅ `letter.ts` - 字符串工具
- ✅ `merge.ts` - 对象合并工具
- ✅ `nprogress.ts` - 进度条工具
- ✅ `resources.ts` - 资源加载工具
- ✅ `state-handler.ts` - 状态处理工具
- ✅ `to.ts` - Promise 工具
- ✅ `tree.ts` - 树形结构工具
- ✅ `unique.ts` - 数组去重工具
- ✅ `update-css-variables.ts` - CSS 变量更新工具
- ✅ `util.ts` - 通用工具
- ✅ `window.ts` - 窗口工具
- ✅ `index.ts` - 工具模块导出

#### 3.4 创建共享模块入口文件

创建 `src/shared/index.ts`：

```typescript
export * from './cache';
export * from './color';
export * from './utils';
```

**验证：**
检查所有文件是否已正确复制，确保没有遗漏。

---

### 步骤 4: 创建 Preferences 模块

在主项目 `src/` 目录下创建 `preferences/` 目录：

```bash
New-Item -ItemType Directory -Force -Path src/preferences
```

从 `example/theme-implementation/src/preferences/` 复制以下文件：

- ✅ `config.ts` - 默认配置
- ✅ `constants.ts` - 主题常量
- ✅ `preferences.ts` - 偏好设置管理器
- ✅ `types.ts` - 类型定义
- ✅ `update-css-variables.ts` - CSS 变量更新逻辑
- ✅ `use-preferences.ts` - Composables
- ✅ `index.ts` - 模块导出

**验证：**
检查所有文件是否已正确复制。

---

### 步骤 5: 创建设计令牌 CSS

在主项目 `src/styles/` 目录下创建 `design-tokens/` 目录：

```bash
New-Item -ItemType Directory -Force -Path src/styles/design-tokens
```

从 `example/theme-implementation/src/styles/design-tokens/` 复制以下文件：

- ✅ `default.css` - 默认主题 CSS 变量（383 行）
- ✅ `dark.css` - 暗色主题 CSS 变量（447 行）
- ✅ `index.ts` - CSS 导入文件

**验证：**
检查 CSS 文件是否完整。

---

### 步骤 6: 更新样式入口文件

更新 `src/styles/index.css`：

```css
@import './design-tokens';

/* 灰色模式 */
.grayscale-mode {
  filter: grayscale(100%);
}

/* 色弱模式 */
.invert-mode {
  filter: invert(100%);
}
```

**说明：**
- 导入设计令牌 CSS
- 添加灰色模式和色弱模式的样式

---

### 步骤 7: 更新类型定义

更新 `src/types/index.ts`，添加主题相关类型导出：

```typescript
// 如果已有其他类型，保留并添加：
export type * from './preferences';

// 或者直接导出 preferences 模块的类型：
export type * from '#/preferences/types';
```

---

### 步骤 8: 更新应用入口文件

更新 `src/main.ts`：

```typescript
import { createApp } from 'vue';
import './styles/index.css';
import App from './App.vue';
import { initPreferences } from './preferences';

// 初始化偏好设置
initPreferences({
  namespace: 'vben-lite',
  overrides: {
    // 可以在这里覆盖默认配置
    // theme: {
    //   mode: 'light',
    //   builtinType: 'default',
    // },
  },
});

createApp(App).mount('#app');
```

**说明：**
- 在创建应用前初始化偏好设置
- 使用命名空间 `vben-lite` 隔离配置
- 可以通过 `overrides` 覆盖默认配置

---

### 步骤 9: 更新根组件（可选）

更新 `src/App.vue`，使用主题系统：

```vue
<script setup lang="ts">
import { usePreferences } from './preferences';

const { isDark, theme: currentTheme, preferences } = usePreferences();
</script>

<template>
  <div
    class="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
  >
    <!-- 你的应用内容 -->
    <h1 class="text-2xl font-bold">Vben Lite</h1>
    <p>当前主题: {{ currentTheme }}</p>
    <p>是否暗色: {{ isDark }}</p>
  </div>
</template>
```

**说明：**
- 使用 CSS 变量 `hsl(var(--background))` 等
- 通过 `usePreferences` 获取主题状态

---

### 步骤 10: 验证配置

#### 10.1 检查路径别名

确保 `vite.config.ts` 中已配置路径别名：

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '#': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```

确保 `tsconfig.app.json` 中已配置路径映射：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "#/*": ["./src/*"]
    }
  }
}
```

#### 10.2 检查 Tailwind 配置

确保 `tailwind.config.js` 中已配置暗色模式：

```javascript
export default {
  darkMode: 'class', // 支持 class 切换暗色模式
  // ... 其他配置
};
```

---

### 步骤 11: 测试运行

#### 11.1 启动开发服务器

```bash
pnpm dev
```

#### 11.2 验证功能

在浏览器中打开应用，检查：

1. **控制台无错误**
   - 打开浏览器开发者工具
   - 检查 Console 是否有错误

2. **主题切换**
   - 检查 HTML 元素是否有 `dark` 类
   - 检查 HTML 元素是否有 `data-theme` 属性

3. **CSS 变量**
   - 在开发者工具中检查 `:root` 是否有 CSS 变量
   - 检查变量值是否正确

4. **持久化存储**
   - 切换主题后刷新页面
   - 检查主题是否保持

---

## 🔍 常见问题排查

### 问题 1: 模块找不到

**错误：** `Cannot find module '#/shared/cache'`

**解决：**
1. 检查 `vite.config.ts` 中的路径别名配置
2. 检查 `tsconfig.app.json` 中的路径映射
3. 重启开发服务器

### 问题 2: CSS 变量不生效

**错误：** CSS 变量未应用

**解决：**
1. 检查 `src/styles/index.css` 是否导入了设计令牌
2. 检查 `main.ts` 中是否导入了样式文件
3. 检查浏览器开发者工具中的 CSS 变量

### 问题 3: 主题切换不生效

**错误：** 切换主题后界面无变化

**解决：**
1. 检查 `initPreferences` 是否在 `createApp` 之前调用
2. 检查 `usePreferences` 是否正确使用
3. 检查 HTML 元素是否有 `dark` 类和 `data-theme` 属性

### 问题 4: TypeScript 类型错误

**错误：** 类型定义找不到

**解决：**
1. 检查 `src/types/index.ts` 是否正确导出类型
2. 检查 `tsconfig.app.json` 中的 `include` 配置
3. 重启 TypeScript 服务器

---

## ✅ 集成完成检查清单

完成所有步骤后，请检查以下项目：

- [ ] 所有依赖已安装
- [ ] 所有文件已复制到正确位置
- [ ] 路径别名配置正确
- [ ] `main.ts` 中已初始化偏好设置
- [ ] 样式文件已正确导入
- [ ] 开发服务器可以正常启动
- [ ] 浏览器控制台无错误
- [ ] 主题切换功能正常
- [ ] CSS 变量正确应用
- [ ] 主题持久化存储正常

---

## 📚 下一步

集成完成后，你可以：

1. **自定义主题配置**
   - 在 `main.ts` 的 `overrides` 中修改默认配置
   - 在组件中使用 `updatePreferences` 动态更新配置

2. **使用 Composables**
   - 在组件中使用 `usePreferences` 获取主题状态
   - 使用 `isDark`, `theme`, `preferences` 等响应式数据

3. **参考示例项目**
   - 查看 `example/theme-implementation/src/App.vue` 了解完整用法
   - 参考 `md/THEME_COMPLETE_GUIDE.md` 了解详细原理

---

## 🎉 完成

恭喜！你已经成功将 Vben 主题系统集成到项目中。

如有问题，请参考：
- `md/THEME_COMPLETE_GUIDE.md` - 完整实现指南
- `example/theme-implementation/` - 示例项目

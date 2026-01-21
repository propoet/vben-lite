# 设计系统测试指南

本文档介绍如何使用设计系统测试组件来验证CSS变量和设计系统的集成。

## 测试组件

### 1. TestDesignSystem.vue - 完整测试组件

位置: `src/components/test-design-system.vue`

这是一个完整的测试组件，包含以下测试功能：

#### 功能特性

1. **主题切换测试**
   - 主题模式切换（亮色/暗色/自动）
   - 内置主题切换（default, violet, pink, rose, sky-blue, deep-blue, green, deep-green, orange, yellow, zinc, neutral, slate, gray, custom）

2. **颜色系统测试**
   - 展示所有主要颜色变量：
     - Primary（主题色）
     - Success（成功色）
     - Warning（警告色）
     - Destructive（危险色）
     - Background（背景色）
     - Foreground（前景色）
     - Card（卡片背景）
     - Border（边框色）
     - Input（输入框边框）
     - Muted（静音背景）
     - Accent（强调色）

3. **按钮示例**
   - 主要按钮
   - 次要按钮
   - 成功按钮
   - 警告按钮
   - 危险按钮
   - 边框按钮

4. **卡片示例**
   - 展示卡片组件的样式

5. **输入框示例**
   - 文本输入框
   - 文本域

6. **设计Token控制**
   - 圆角控制（--radius）
   - 字体大小控制（--font-size-base）

7. **状态展示**
   - 显示当前所有主题相关状态

### 2. TestSimpleColor.vue - 简单颜色测试

位置: `src/components/test-simple-color.vue`

这是一个简化的测试组件，用于快速验证颜色系统是否正常工作。

## 使用方法

### 在App.vue中使用

当前 `App.vue` 已经集成了 `TestDesignSystem` 组件：

```vue
<script setup lang="ts">
import TestDesignSystem from './components/test-design-system.vue'
</script>

<template>
  <TestDesignSystem />
</template>
```

### 切换到简单测试

如果需要使用简单测试，可以修改 `App.vue`：

```vue
<script setup lang="ts">
import TestSimpleColor from './components/test-simple-color.vue'
</script>

<template>
  <TestSimpleColor />
</template>
```

## 测试要点

### 1. 主题切换测试

- 点击"主题模式"按钮，验证亮色/暗色/自动模式切换
- 点击"内置主题"按钮，验证不同主题的颜色变化
- 观察页面颜色是否实时更新

### 2. 颜色变量测试

- 检查所有颜色卡片是否正确显示
- 验证颜色在亮色/暗色模式下的对比度
- 确认前景色与背景色的搭配是否合理

### 3. 组件样式测试

- 测试按钮在不同主题下的显示效果
- 验证卡片、输入框等组件的样式
- 检查圆角和字体大小的动态调整

### 4. CSS变量验证

打开浏览器开发者工具，检查 `:root` 元素上的CSS变量：

```css
--primary: 212 100% 45%;
--background: 0 0% 100%;
--foreground: 210 6% 21%;
--radius: 0.5rem;
--font-size-base: 16px;
```

### 5. 暗色模式验证

- 切换到暗色模式
- 检查 `.dark` 类是否正确添加到 `<html>` 元素
- 验证所有颜色在暗色模式下的显示

### 6. 主题预设验证

- 切换不同的内置主题（violet, pink, rose等）
- 检查 `data-theme` 属性是否正确设置
- 验证主题颜色是否正确应用

## 预期行为

1. **主题切换应该：**
   - 立即更新页面颜色
   - 保持状态（刷新后仍然有效）
   - 在自动模式下跟随系统主题

2. **颜色变量应该：**
   - 在所有组件中正确应用
   - 在亮色/暗色模式下有适当的对比度
   - 支持HSL格式的颜色值

3. **设计Token应该：**
   - 圆角值影响所有使用 `var(--radius)` 的元素
   - 字体大小影响所有使用 `var(--font-size-base)` 的元素

## 常见问题

### 颜色不更新

- 检查 `updateCSSVariables` 函数是否被正确调用
- 验证 `preferencesManager.updatePreferences` 是否正常工作
- 查看浏览器控制台是否有错误

### 主题切换无效

- 确认 `preferences.theme.mode` 是否正确更新
- 检查 `isDarkTheme` 函数逻辑
- 验证 `document.documentElement.classList.toggle('dark')` 是否执行

### CSS变量未应用

- 检查设计token CSS文件是否正确导入
- 验证CSS变量名称是否匹配
- 确认Tailwind配置是否正确

## 扩展测试

可以基于这些测试组件创建更多测试场景：

1. **响应式测试** - 在不同屏幕尺寸下测试
2. **性能测试** - 测试主题切换的性能
3. **可访问性测试** - 检查颜色对比度是否符合WCAG标准
4. **自定义主题测试** - 测试自定义颜色主题功能

## 相关文件

- `src/styles/design-tokens/default.css` - 亮色主题变量
- `src/styles/design-tokens/dark.css` - 暗色主题变量
- `src/preferences/update-css-variables.ts` - CSS变量更新逻辑
- `src/preferences/use-preferences.ts` - 偏好设置Hook
- `src/preferences/constants.ts` - 内置主题预设

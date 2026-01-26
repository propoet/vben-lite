# Vben 状态管理（Stores）完整集成指南

## 目录

1. [概述](#概述)
2. [架构原理](#架构原理)
3. [依赖安装](#依赖安装)
4. [代码结构](#代码结构)
5. [集成步骤](#集成步骤) ⭐ **核心章节**
6. [代码说明](#代码说明)
7. [测试步骤](#测试步骤)
8. [常见问题](#常见问题)

## 集成步骤

> **重要**：本节提供了详细的集成步骤，适用于所有项目。如果您的项目已有部分代码（如 preferences、shared/utils 等），这些步骤同样适用。

### 与现有项目的兼容性

1. **类型兼容**：
   - 项目已有 `UserInfo` 类型，`BasicUserInfo` 与其兼容
   - `BasicUserInfo` 允许 `[key: string]: any`，可以扩展为 `UserInfo`

2. **工具函数**：
   - `openRouteInNewWindow`、`startProgress`、`stopProgress` 在 `src/shared/utils/` 中已存在 ✅
   - `getCurrentTimezone`、`setCurrentTimezone` 在 `src/shared/utils/date.ts` 中已存在 ✅

3. **Preferences**：
   - 时区常量需要添加到 `src/preferences/constants.ts` 或创建独立文件
   - `preferences` 对象从 `#/preferences` 导入

4. **导入路径**：
   - 所有导入使用 `#/` 别名（指向 `src/`）
   - 类型从 `#/types` 导入
   - Preferences 从 `#/preferences` 导入
   - 工具函数从 `#/shared/utils` 导入

### 集成步骤

#### 步骤 1：安装依赖

```bash
pnpm add pinia pinia-plugin-persistedstate secure-ls
```

#### 步骤 2：添加类型定义

**2.1 添加菜单类型**

**文件位置**：`src/types/menu-record.ts`（新建）

将 `example/stores-integration/src/types/menu-record.ts` 复制到 `src/types/menu-record.ts`

**2.2 添加标签页类型**

**文件位置**：`src/types/tabs.ts`（新建）

将 `example/stores-integration/src/types/tabs.ts` 复制到 `src/types/tabs.ts`

**2.3 添加基础类型**

**文件位置**：`src/types/basic.d.ts`（新建）

将 `example/stores-integration/src/types/basic.d.ts` 复制到 `src/types/basic.d.ts`

**注意**：项目已有 `UserInfo` 类型，`BasicUserInfo` 与其兼容，但更基础。

**2.4 添加应用类型**

**文件位置**：`src/types/app.d.ts`（新建）

将 `example/stores-integration/src/types/app.d.ts` 复制到 `src/types/app.d.ts`

**2.5 更新类型导出**

**文件位置**：`src/types/index.ts`（修改）

在文件末尾添加：

```typescript
// Stores 相关类型
export type * from './menu-record';
export type * from './tabs';
export type * from './basic';
export type * from './app';
```

#### 步骤 3：添加时区常量

**方式一：添加到现有 constants.ts（推荐）**

**文件位置**：`src/preferences/constants.ts`（修改）

在文件末尾添加：

```typescript
import type { TimezoneOption } from '#/types';

/**
 * 默认时区选项
 * 定义了常用的时区选项，用于时区选择器
 */
export const DEFAULT_TIME_ZONE_OPTIONS: TimezoneOption[] = [
  {
    offset: -5,
    timezone: 'America/New_York',
    label: 'America/New_York(GMT-5)',
  },
  {
    offset: 0,
    timezone: 'Europe/London',
    label: 'Europe/London(GMT0)',
  },
  {
    offset: 8,
    timezone: 'Asia/Shanghai',
    label: 'Asia/Shanghai(GMT+8)',
  },
  {
    offset: 9,
    timezone: 'Asia/Tokyo',
    label: 'Asia/Tokyo(GMT+9)',
  },
  {
    offset: 9,
    timezone: 'Asia/Seoul',
    label: 'Asia/Seoul(GMT+9)',
  },
];
```

**方式二：创建独立文件**

**文件位置**：`src/preferences/constants-timezone.ts`（新建）

将 `example/stores-integration/src/preferences/constants-timezone.ts` 复制到 `src/preferences/constants-timezone.ts`

然后在 `src/preferences/index.ts` 中添加导出：

```typescript
export * from './constants-timezone';
```

#### 步骤 4：创建 Stores 目录结构

**目录位置**：`src/stores/`（新建）

创建以下目录结构：

```
src/stores/
├── setup.ts
├── shim-pinia.d.ts
├── index.ts
└── modules/
    ├── index.ts
    ├── user.ts
    ├── access.ts
    ├── tabbar.ts
    └── timezone.ts
```

#### 步骤 5：复制 Stores 文件

从 `example/stores-integration/src/stores/` 复制所有文件到 `src/stores/`：

- `setup.ts`
- `shim-pinia.d.ts`
- `index.ts`
- `modules/index.ts`
- `modules/user.ts`
- `modules/access.ts`
- `modules/tabbar.ts`
- `modules/timezone.ts`

#### 步骤 6：配置环境变量

**文件位置**：`.env`（修改）

添加：

```env
VITE_APP_STORE_SECURE_KEY=your-secret-key-change-this-in-production
```

**注意**：生产环境必须使用强密钥。

#### 步骤 7：更新 bootstrap.ts

**文件位置**：`src/bootstrap.ts`（修改）

在 `setupI18n` 之后、`app.use(ElementPlus)` 之前添加：

```typescript
import { initStores } from '#/stores'

export async function bootstrap(namespace: string) {
  console.log('namespace', namespace)
  const app = createApp(App)
  
  // 设置国际化
  await setupI18n(app)

  // 初始化 Stores（必须在其他插件之前）
  await initStores(app, { namespace })

  // 注册 Element Plus 插件
  app.use(ElementPlus)

  app.mount('#app')
}
```

#### 步骤 8：验证工具函数

确保以下工具函数在项目中存在：

- `src/shared/utils/window.ts` - 包含 `openRouteInNewWindow` ✅ 已存在
- `src/shared/utils/nprogress.ts` - 包含 `startProgress`, `stopProgress` ✅ 已存在
- `src/shared/utils/date.ts` - 包含 `getCurrentTimezone`, `setCurrentTimezone` ✅ 已存在

这些文件在项目中已存在，无需修改。

#### 步骤 9：完成检查清单

- [ ] 所有类型文件已创建并导出
- [ ] 时区常量已添加
- [ ] Stores 文件已复制
- [ ] 依赖已安装
- [ ] 环境变量已配置
- [ ] bootstrap.ts 已更新
- [ ] 工具函数已确认存在
- [ ] 测试通过（参考下方测试步骤）

---

## 概述

### 什么是 Vben Stores？

Vben Stores 是基于 **Pinia** 的状态管理方案，提供了以下核心功能：

1. **用户信息管理**（User Store）：管理用户基本信息和角色
2. **权限管理**（Access Store）：管理登录状态、权限码、菜单、路由
3. **标签页管理**（Tabbar Store）：管理多标签页的打开、关闭、固定、刷新等
4. **时区管理**（Timezone Store）：管理应用时区设置

### 核心特性

- ✅ **持久化存储**：使用 `pinia-plugin-persistedstate` 实现状态持久化
- ✅ **加密存储**：生产环境使用 `secure-ls` 加密敏感数据
- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **热更新支持**：开发环境支持 HMR
- ✅ **命名空间隔离**：支持多应用场景，避免数据冲突

---

## 架构原理

### 1. Pinia 基础架构

```
┌─────────────────────────────────────┐
│         Vue Application              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│            Pinia Instance            │
│  ┌──────────────────────────────┐   │
│  │  PersistedState Plugin        │   │
│  │  - localStorage (dev)         │   │
│  │  - SecureLS (prod)            │   │
│  └──────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│ User Store  │  │Access Store │
└─────────────┘  └─────────────┘
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│Tabbar Store │  │Timezone Store│
└─────────────┘  └─────────────┘
```

### 2. 持久化策略

#### 开发环境
- **存储方式**：`localStorage`
- **原因**：方便调试，可以直接查看和修改数据
- **Key 格式**：`{namespace}-{store.id}`

#### 生产环境
- **存储方式**：`SecureLS`（AES 加密）
- **原因**：提高安全性，防止敏感数据泄露
- **加密算法**：AES
- **压缩**：启用压缩，减少存储空间

### 3. Store 模块说明

#### User Store（用户信息）
- **状态**：`userInfo`、`userRoles`
- **持久化**：否（用户信息通常存储在 Access Store）
- **用途**：管理用户基本信息和角色

#### Access Store（权限管理）
- **状态**：`accessToken`、`refreshToken`、`accessCodes`、`accessMenus`、`accessRoutes` 等
- **持久化**：部分字段（token、codes、锁屏状态）
- **用途**：管理登录状态、权限、菜单、路由

#### Tabbar Store（标签页管理）
- **状态**：`tabs`、`cachedTabs`、`excludeCachedTabs` 等
- **持久化**：`tabs`（sessionStorage）
- **用途**：管理多标签页的打开、关闭、固定、刷新等

#### Timezone Store（时区管理）
- **状态**：`timezone`
- **持久化**：是
- **用途**：管理应用时区设置，与 dayjs 集成

---

## 依赖安装

### 1. 核心依赖

```bash
# Pinia 状态管理库
pnpm add pinia

# Pinia 持久化插件
pnpm add pinia-plugin-persistedstate

# 加密存储库（生产环境）
pnpm add secure-ls
```

### 2. 类型定义依赖

```bash
# Vue Router（用于路由类型）
pnpm add vue-router

# Vue（用于组件类型）
pnpm add vue
```

### 3. 工具依赖

```bash
# dayjs 时区插件（时区 Store 需要）
pnpm add dayjs
```

### 4. 环境变量配置

在 `.env` 文件中添加：

```env
# Store 加密密钥（生产环境使用）
VITE_APP_STORE_SECURE_KEY=your-secret-key-here
```

**注意**：生产环境必须设置一个强密钥，建议使用随机生成的字符串。

---

## 代码结构

### 目录结构

```
example/stores-integration/
├── src/
│   ├── types/                    # 类型定义
│   │   ├── menu-record.ts       # 菜单类型
│   │   ├── tabs.ts              # 标签页类型
│   │   ├── basic.d.ts          # 基础类型
│   │   ├── app.d.ts            # 应用类型
│   │   └── index.ts            # 类型导出
│   │
│   ├── stores/                   # Store 模块
│   │   ├── setup.ts             # Store 初始化
│   │   ├── shim-pinia.d.ts      # Pinia 类型声明
│   │   ├── index.ts             # Store 导出
│   │   └── modules/             # Store 模块
│   │       ├── index.ts         # 模块导出
│   │       ├── user.ts          # 用户 Store
│   │       ├── access.ts        # 权限 Store
│   │       ├── tabbar.ts        # 标签页 Store
│   │       └── timezone.ts      # 时区 Store
│   │
│   └── preferences/              # 偏好设置（时区选项）
│       └── constants-timezone.ts # 时区常量
```

### 文件位置说明

所有代码文件位于：`example/stores-integration/src/`

---

## 代码说明

### 1. Store 初始化（setup.ts）

#### 核心功能

```typescript
export async function initStores(app: App, options: InitStoreOptions) {
  // 1. 动态导入持久化插件
  const { createPersistedState } = await import('pinia-plugin-persistedstate');
  
  // 2. 创建 Pinia 实例
  pinia = createPinia();
  
  // 3. 配置 SecureLS（生产环境）
  const ls = new SecureLS({
    encodingType: 'aes',
    encryptionSecret: import.meta.env.VITE_APP_STORE_SECURE_KEY,
    isCompression: true,
  });
  
  // 4. 使用持久化插件
  pinia.use(createPersistedState({
    key: (storeKey) => `${namespace}-${storeKey}`,
    storage: import.meta.env.DEV ? localStorage : { ... }
  }));
  
  // 5. 注册到 Vue 应用
  app.use(pinia);
}
```

#### 原理说明

1. **动态导入**：使用动态导入减少初始包大小
2. **命名空间**：通过命名空间避免多应用数据冲突
3. **环境区分**：开发环境使用 localStorage，生产环境使用加密存储
4. **Key 生成**：格式为 `{namespace}-{store.id}`，例如：`vben-lite-1.0.0-dev-core-user`

### 2. User Store（用户信息）

#### 状态结构

```typescript
interface AccessState {
  userInfo: BasicUserInfo | null;  // 用户信息
  userRoles: string[];              // 用户角色
}
```

#### 主要方法

- `setUserInfo(userInfo)`: 设置用户信息，自动提取角色
- `setUserRoles(roles)`: 单独设置用户角色

#### 使用场景

```typescript
import { useUserStore } from '#/stores'

const userStore = useUserStore()

// 登录后设置用户信息
userStore.setUserInfo({
  userId: '1',
  username: 'admin',
  realName: '管理员',
  avatar: '/avatar.png',
  roles: ['admin', 'user']
})

// 获取用户信息
const userInfo = userStore.userInfo
const roles = userStore.userRoles
```

### 3. Access Store（权限管理）

#### 状态结构

```typescript
interface AccessState {
  accessToken: AccessToken;        // 访问令牌
  refreshToken: AccessToken;      // 刷新令牌
  accessCodes: string[];            // 权限码
  accessMenus: MenuRecordRaw[];    // 可访问菜单
  accessRoutes: RouteRecordRaw[]; // 可访问路由
  isAccessChecked: boolean;        // 是否已检查权限
  isLockScreen: boolean;           // 是否锁屏
  lockScreenPassword?: string;     // 锁屏密码
  loginExpired: boolean;           // 登录是否过期
}
```

#### 持久化字段

- `accessToken`、`refreshToken`：保持登录状态
- `accessCodes`：权限判断
- `isLockScreen`、`lockScreenPassword`：锁屏功能

#### 主要方法

- `setAccessToken(token)`: 设置访问令牌
- `setRefreshToken(token)`: 设置刷新令牌
- `setAccessCodes(codes)`: 设置权限码
- `setAccessMenus(menus)`: 设置可访问菜单
- `setAccessRoutes(routes)`: 设置可访问路由
- `getMenuByPath(path)`: 根据路径查找菜单
- `lockScreen(password)`: 锁屏
- `unlockScreen()`: 解锁

#### 使用场景

```typescript
import { useAccessStore } from '#/stores'

const accessStore = useAccessStore()

// 登录后设置 token
accessStore.setAccessToken('token-xxx')
accessStore.setRefreshToken('refresh-token-xxx')

// 设置权限
accessStore.setAccessCodes(['user:read', 'user:write'])
accessStore.setAccessMenus([...])
accessStore.setAccessRoutes([...])

// 权限判断
const hasPermission = accessStore.accessCodes.includes('user:write')

// 查找菜单
const menu = accessStore.getMenuByPath('/dashboard')
```

### 4. Tabbar Store（标签页管理）

#### 状态结构

```typescript
interface TabbarState {
  tabs: TabDefinition[];           // 标签页列表
  cachedTabs: Set<string>;         // 缓存的标签页
  excludeCachedTabs: Set<string>;  // 排除缓存的标签页
  dragEndIndex: number;            // 拖拽结束索引
  menuList: string[];              // 右键菜单列表
  renderRouteView?: boolean;        // 是否渲染路由视图
  updateTime?: number;              // 更新时间
}
```

#### 持久化

- `tabs`：持久化到 `sessionStorage`，页面刷新后恢复

#### 主要方法

- `addTab(tab)`: 添加标签页
- `closeTab(tab, router)`: 关闭标签页
- `closeAllTabs(router)`: 关闭所有标签页
- `closeLeftTabs(tab)`: 关闭左侧标签页
- `closeRightTabs(tab)`: 关闭右侧标签页
- `closeOtherTabs(tab)`: 关闭其他标签页
- `pinTab(tab)`: 固定标签页
- `unpinTab(tab)`: 取消固定标签页
- `refresh(router)`: 刷新标签页
- `setTabTitle(tab, title)`: 设置标签页标题
- `sortTabs(oldIndex, newIndex)`: 排序标签页

#### 使用场景

```typescript
import { useTabbarStore } from '#/stores'
import { useRouter } from 'vue-router'

const tabbarStore = useTabbarStore()
const router = useRouter()

// 路由切换时自动添加标签页（通常在路由守卫中）
router.beforeEach((to) => {
  tabbarStore.addTab(to)
})

// 关闭标签页
tabbarStore.closeTab(tab, router)

// 刷新标签页
tabbarStore.refresh(router)

// 获取标签页列表
const tabs = tabbarStore.getTabs

// 获取缓存的标签页（用于 keep-alive）
const cachedTabs = tabbarStore.getCachedTabs
```

### 5. Timezone Store（时区管理）

#### 状态结构

```typescript
{
  timezone: Ref<string>  // 当前时区
}
```

#### 持久化

- `timezone`：持久化，页面刷新后恢复

#### 主要方法

- `setTimezone(timezone)`: 设置时区
- `getTimezoneOptions()`: 获取时区选项列表
- `initTimezone()`: 初始化时区（自动调用）

#### 自定义时区处理

```typescript
import { setTimezoneHandler } from '#/stores'

// 自定义时区获取和保存逻辑
setTimezoneHandler({
  // 从服务器获取时区
  async getTimezone() {
    const response = await fetch('/api/user/timezone')
    return response.json().timezone
  },
  // 保存时区到服务器
  async setTimezone(timezone) {
    await fetch('/api/user/timezone', {
      method: 'POST',
      body: JSON.stringify({ timezone })
    })
  },
  // 自定义时区选项
  async getTimezoneOptions() {
    return [
      { label: '上海', value: 'Asia/Shanghai' },
      // ...
    ]
  }
})
```

#### 使用场景

```typescript
import { useTimezoneStore } from '#/stores'

const timezoneStore = useTimezoneStore()

// 获取当前时区
const timezone = timezoneStore.timezone

// 设置时区
await timezoneStore.setTimezone('Asia/Shanghai')

// 获取时区选项
const options = await timezoneStore.getTimezoneOptions()
```

---

## 测试步骤

### 测试 1：Store 初始化

1. 启动应用：`pnpm dev`
2. 打开浏览器控制台
3. 检查是否有错误
4. 在控制台输入：

```javascript
// 检查 Pinia 是否已注册
console.log(window.__VUE_DEVTOOLS_GLOBAL_HOOK__)
```

### 测试 2：User Store

在组件中测试：

```vue
<script setup lang="ts">
import { useUserStore } from '#/stores'

const userStore = useUserStore()

// 设置用户信息
userStore.setUserInfo({
  userId: '1',
  username: 'test',
  realName: '测试用户',
  avatar: '/avatar.png',
  roles: ['admin']
})

// 查看状态
console.log('用户信息:', userStore.userInfo)
console.log('用户角色:', userStore.userRoles)
</script>
```

**预期结果**：控制台输出用户信息和角色。

### 测试 3：Access Store

```vue
<script setup lang="ts">
import { useAccessStore } from '#/stores'

const accessStore = useAccessStore()

// 设置 token
accessStore.setAccessToken('test-token-123')
accessStore.setRefreshToken('refresh-token-456')

// 设置权限码
accessStore.setAccessCodes(['user:read', 'user:write'])

// 查看状态
console.log('Token:', accessStore.accessToken)
console.log('权限码:', accessStore.accessCodes)

// 刷新页面，检查持久化
// 刷新后，token 和权限码应该还在
</script>
```

**预期结果**：
1. 控制台输出 token 和权限码
2. 刷新页面后，数据仍然存在（检查 localStorage 或加密存储）

### 测试 4：Tabbar Store

```vue
<script setup lang="ts">
import { useTabbarStore } from '#/stores'
import { useRouter } from 'vue-router'

const tabbarStore = useTabbarStore()
const router = useRouter()

// 添加标签页
tabbarStore.addTab({
  path: '/test',
  name: 'Test',
  meta: { title: '测试页面' }
} as any)

// 查看标签页列表
console.log('标签页列表:', tabbarStore.getTabs)

// 关闭标签页
// tabbarStore.closeTab(tab, router)
</script>
```

**预期结果**：控制台输出标签页列表。

### 测试 5：Timezone Store

```vue
<script setup lang="ts">
import { useTimezoneStore } from '#/stores'

const timezoneStore = useTimezoneStore()

// 查看当前时区
console.log('当前时区:', timezoneStore.timezone)

// 设置时区
await timezoneStore.setTimezone('Asia/Shanghai')
console.log('新时区:', timezoneStore.timezone)

// 获取时区选项
const options = await timezoneStore.getTimezoneOptions()
console.log('时区选项:', options)
</script>
```

**预期结果**：
1. 控制台输出当前时区
2. 设置后时区更新
3. 输出时区选项列表

### 测试 6：持久化测试

1. 设置一些 Store 数据
2. 刷新页面
3. 检查数据是否恢复

**开发环境**：检查 `localStorage`，应该能看到 `{namespace}-core-*` 的 key。

**生产环境**：数据是加密的，无法直接查看，但刷新后数据应该恢复。

### 测试 7：多应用隔离测试

如果项目中有多个应用：

1. 使用不同的 `namespace` 初始化
2. 设置不同的数据
3. 检查数据是否互相隔离

---

## 常见问题

### Q1: 初始化时提示 "Pinia is not installed"

**原因**：`initStores` 在 `app.use(pinia)` 之前被调用，或者 Pinia 未正确安装。

**解决**：
1. 确保 `initStores` 在 `bootstrap` 中正确调用
2. 检查 `pinia` 是否已安装：`pnpm list pinia`

### Q2: 持久化不生效

**原因**：
1. `persist` 配置错误
2. 存储 key 冲突
3. 浏览器禁用了 localStorage

**解决**：
1. 检查 Store 中的 `persist` 配置
2. 检查浏览器控制台是否有错误
3. 检查 localStorage 是否可用

### Q3: 生产环境加密存储报错

**原因**：`VITE_APP_STORE_SECURE_KEY` 未设置或格式错误。

**解决**：
1. 在 `.env` 文件中设置 `VITE_APP_STORE_SECURE_KEY`
2. 确保密钥足够长（建议 32 字符以上）

### Q4: 类型错误

**原因**：类型定义文件缺失或路径错误。

**解决**：
1. 确保所有类型文件已创建
2. 检查 `tsconfig.json` 中的路径配置
3. 确保 `#/types` 别名正确配置

### Q5: 标签页刷新不生效

**原因**：
1. `keep-alive` 组件未正确配置
2. `excludeCachedTabs` 未正确使用

**解决**：
1. 确保 `keep-alive` 的 `exclude` 属性绑定到 `tabbarStore.getExcludeCachedTabs`
2. 检查路由的 `meta.keepAlive` 配置

### Q6: 时区设置不生效

**原因**：dayjs 时区插件未正确配置。

**解决**：
1. 确保 `dayjs` 已安装
2. 确保 `dayjs/plugin/timezone` 和 `dayjs/plugin/utc` 已导入和扩展
3. 检查 `setCurrentTimezone` 函数是否正确调用

---

## 总结

本文档详细介绍了 Vben Stores 的完整集成过程，包括：

1. ✅ **架构原理**：理解 Pinia + 持久化插件的工作机制
2. ✅ **依赖安装**：安装所有必需的依赖包
3. ✅ **代码结构**：了解文件组织和职责
4. ✅ **逐步集成**：10 个详细步骤，从零开始集成
5. ✅ **代码说明**：每个 Store 的详细说明和使用场景
6. ✅ **测试步骤**：7 个测试用例，验证功能
7. ✅ **常见问题**：6 个常见问题及解决方案

### 关键要点

1. **命名空间**：使用命名空间避免多应用数据冲突
2. **环境区分**：开发环境使用 localStorage，生产环境使用加密存储
3. **持久化策略**：只持久化必要的字段，避免存储过大
4. **类型安全**：完整的 TypeScript 类型定义，提供良好的开发体验
5. **热更新支持**：开发环境支持 HMR，提高开发效率

### 下一步

集成完成后，可以：

1. 在路由守卫中使用 Access Store 进行权限控制
2. 在布局组件中使用 Tabbar Store 管理标签页
3. 在用户相关组件中使用 User Store 显示用户信息
4. 在日期时间组件中使用 Timezone Store 处理时区

---

## 附录

### A. 完整文件清单

所有需要创建/修改的文件：

```
src/
├── types/
│   ├── menu-record.ts          ✅ 新建
│   ├── tabs.ts                 ✅ 新建
│   ├── basic.d.ts              ✅ 新建
│   ├── app.d.ts                ✅ 新建
│   └── index.ts                ⚠️ 修改（添加导出）
│
├── stores/
│   ├── setup.ts                ✅ 新建
│   ├── shim-pinia.d.ts         ✅ 新建
│   ├── index.ts                ✅ 新建
│   └── modules/
│       ├── index.ts            ✅ 新建
│       ├── user.ts             ✅ 新建
│       ├── access.ts           ✅ 新建
│       ├── tabbar.ts           ✅ 新建
│       └── timezone.ts         ✅ 新建
│
├── preferences/
│   └── constants-timezone.ts   ✅ 新建（或修改 constants.ts）
│
├── bootstrap.ts                ⚠️ 修改（添加 initStores）
│
└── .env                        ⚠️ 修改（添加 VITE_APP_STORE_SECURE_KEY）
```

**注意**：
- ✅ 表示新建文件
- ⚠️ 表示修改现有文件
- 工具函数文件（`window.ts`、`nprogress.ts`、`date.ts`）在项目中已存在，无需创建

### B. 依赖版本建议

```json
{
  "pinia": "^3.0.4",
  "pinia-plugin-persistedstate": "^4.7.1",
  "secure-ls": "^1.2.6",
  "vue": "^3.5.24",
  "vue-router": "^4.6.4",
  "dayjs": "^1.11.19"
}
```

### C. 环境变量模板

```env
# 应用配置
VITE_APP_NAME=vben-lite
VITE_APP_VERSION=1.0.0

# Store 加密密钥（生产环境必须修改）
VITE_APP_STORE_SECURE_KEY=change-this-to-a-strong-secret-key-in-production
```

---

---

## 快速参考

### 文件位置

- **示例代码**：`example/stores-integration/src/`
- **完整文档**：`md/STORES_INTEGRATION_GUIDE.md`（本文档）

### 集成方式

按照"集成步骤"章节操作即可，适用于所有项目。

---

**文档版本**：1.2.0  
**最后更新**：2026-01-26  
**作者**：Vben Integration Guide

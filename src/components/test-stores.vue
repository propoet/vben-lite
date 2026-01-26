<template>
  <div class="stores-test-container">
    <h2>Stores 功能测试</h2>

    <!-- User Store 测试 -->
    <el-card class="test-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>测试 1：User Store（用户信息）</span>
          <el-button type="primary" size="small" @click="testUserStore">
            执行测试
          </el-button>
        </div>
      </template>
      <div class="test-content">
        <p><strong>当前用户信息：</strong></p>
        <pre>{{ JSON.stringify(userInfo, null, 2) }}</pre>
        <p><strong>当前用户角色：</strong></p>
        <pre>{{ JSON.stringify(userRoles, null, 2) }}</pre>
      </div>
    </el-card>

    <!-- Access Store 测试 -->
    <el-card class="test-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>测试 2：Access Store（权限管理）</span>
          <el-button type="primary" size="small" @click="testAccessStore">
            执行测试
          </el-button>
        </div>
      </template>
      <div class="test-content">
        <p><strong>Access Token：</strong>{{ accessToken || '未设置' }}</p>
        <p><strong>Refresh Token：</strong>{{ refreshToken || '未设置' }}</p>
        <p><strong>权限码：</strong></p>
        <pre>{{ JSON.stringify(accessCodes, null, 2) }}</pre>
        <p><strong>是否已检查权限：</strong>{{ isAccessChecked ? '是' : '否' }}</p>
        <p><strong>是否锁屏：</strong>{{ isLockScreen ? '是' : '否' }}</p>
        <el-button
          type="warning"
          size="small"
          @click="testLockScreen"
          style="margin-top: 10px"
        >
          测试锁屏
        </el-button>
        <el-button
          type="success"
          size="small"
          @click="testUnlockScreen"
          style="margin-top: 10px; margin-left: 10px"
        >
          解锁
        </el-button>
      </div>
    </el-card>

    <!-- Tabbar Store 测试 -->
    <el-card class="test-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>测试 3：Tabbar Store（标签页管理）</span>
          <el-button type="primary" size="small" @click="testTabbarStore">
            执行测试
          </el-button>
        </div>
      </template>
      <div class="test-content">
        <p><strong>标签页数量：</strong>{{ tabs.length }}</p>
        <p><strong>缓存的标签页：</strong></p>
        <pre>{{ JSON.stringify(cachedTabs, null, 2) }}</pre>
        <p><strong>标签页列表：</strong></p>
        <div v-for="(tab, index) in tabs" :key="index" class="tab-item">
          <span>{{ tab.name || tab.path }}</span>
          <el-tag v-if="tab.meta?.affixTab" type="success" size="small" style="margin-left: 10px">
            固定
          </el-tag>
        </div>
        <el-button
          type="info"
          size="small"
          @click="testAddTab"
          style="margin-top: 10px"
        >
          添加测试标签页
        </el-button>
        <el-button
          type="danger"
          size="small"
          @click="testRefreshTab"
          style="margin-top: 10px; margin-left: 10px"
        >
          刷新当前标签页
        </el-button>
      </div>
    </el-card>

    <!-- Timezone Store 测试 -->
    <el-card class="test-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>测试 4：Timezone Store（时区管理）</span>
          <el-button type="primary" size="small" @click="testTimezoneStore">
            执行测试
          </el-button>
        </div>
      </template>
      <div class="test-content">
        <p><strong>当前时区：</strong>{{ currentTimezone }}</p>
        <p><strong>时区选项：</strong></p>
        <el-select
          v-model="selectedTimezone"
          placeholder="选择时区"
          style="width: 300px"
          @change="handleTimezoneChange"
        >
          <el-option
            v-for="option in timezoneOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-button
          type="success"
          size="small"
          @click="loadTimezoneOptions"
          style="margin-left: 10px"
        >
          加载时区选项
        </el-button>
      </div>
    </el-card>

    <!-- 持久化测试 -->
    <el-card class="test-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>测试 5：持久化测试</span>
          <el-button type="primary" size="small" @click="testPersistence">
            执行测试
          </el-button>
        </div>
      </template>
      <div class="test-content">
        <p>
          <strong>说明：</strong>设置一些数据后，刷新页面检查数据是否恢复
        </p>
        <p><strong>开发环境：</strong>检查 localStorage，应该能看到命名空间相关的 key</p>
        <p><strong>生产环境：</strong>数据是加密的，但刷新后数据应该恢复</p>
        <el-button type="warning" size="small" @click="clearAllData" style="margin-top: 10px">
          清除所有数据（测试用）
        </el-button>
      </div>
    </el-card>

    <!-- 测试结果 -->
    <el-card class="test-card" shadow="hover">
      <template #header>
        <span>测试结果</span>
      </template>
      <div class="test-content">
        <el-alert
          v-for="(result, index) in testResults"
          :key="index"
          :title="result.title"
          :type="result.type"
          :description="result.message"
          show-icon
          :closable="false"
          style="margin-bottom: 10px"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  useUserStore,
  useAccessStore,
  useTabbarStore,
  useTimezoneStore,
  resetAllStores
} from '#/stores'

const router = useRouter()

// Store 实例
const userStore = useUserStore()
const accessStore = useAccessStore()
const tabbarStore = useTabbarStore()
const timezoneStore = useTimezoneStore()

// 响应式数据
const testResults = ref<
  Array<{
    title: string
    type: 'success' | 'warning' | 'error' | 'info'
    message: string
  }>
>([])

// User Store 数据
const userInfo = computed(() => userStore.userInfo)
const userRoles = computed(() => userStore.userRoles)

// Access Store 数据
const accessToken = computed(() => accessStore.accessToken)
const refreshToken = computed(() => accessStore.refreshToken)
const accessCodes = computed(() => accessStore.accessCodes)
const isAccessChecked = computed(() => accessStore.isAccessChecked)
const isLockScreen = computed(() => accessStore.isLockScreen)

// Tabbar Store 数据
const tabs = computed(() => tabbarStore.getTabs)
const cachedTabs = computed(() => tabbarStore.getCachedTabs)

// Timezone Store 数据
const currentTimezone = computed(() => timezoneStore.timezone)
const selectedTimezone = ref<string>('')
const timezoneOptions = ref<Array<{ label: string; value: string }>>([])

// 添加测试结果
function addTestResult(
  title: string,
  type: 'success' | 'warning' | 'error' | 'info',
  message: string
) {
  testResults.value.push({ title, type, message })
  ElMessage({
    message: `${title}: ${message}`,
    type
  })
}

// 测试 1：User Store
async function testUserStore() {
  try {
    // 设置用户信息
    userStore.setUserInfo({
      userId: '1',
      username: 'test-user',
      realName: '测试用户',
      avatar: '/avatar.png',
      roles: ['admin', 'user']
    })

    // 查看状态
    console.log('用户信息:', userStore.userInfo)
    console.log('用户角色:', userStore.userRoles)

    addTestResult(
      'User Store 测试',
      'success',
      `用户信息已设置：${userStore.userInfo?.realName}，角色：${userStore.userRoles.join(', ')}`
    )
  } catch (error) {
    addTestResult('User Store 测试', 'error', `测试失败：${error}`)
  }
}

// 测试 2：Access Store
async function testAccessStore() {
  try {
    // 设置 token
    accessStore.setAccessToken('test-token-123')
    accessStore.setRefreshToken('refresh-token-456')

    // 设置权限码
    accessStore.setAccessCodes(['user:read', 'user:write', 'admin:manage'])

    // 设置权限检查状态
    accessStore.setIsAccessChecked(true)

    // 查看状态
    console.log('Token:', accessStore.accessToken)
    console.log('Refresh Token:', accessStore.refreshToken)
    console.log('权限码:', accessStore.accessCodes)

    addTestResult(
      'Access Store 测试',
      'success',
      `Token 已设置，权限码：${accessStore.accessCodes.join(', ')}`
    )
  } catch (error) {
    addTestResult('Access Store 测试', 'error', `测试失败：${error}`)
  }
}

// 测试锁屏
function testLockScreen() {
  try {
    accessStore.lockScreen('123456')
    addTestResult('锁屏测试', 'success', '锁屏已激活，密码：123456')
  } catch (error) {
    addTestResult('锁屏测试', 'error', `测试失败：${error}`)
  }
}

// 测试解锁
function testUnlockScreen() {
  try {
    accessStore.unlockScreen()
    addTestResult('解锁测试', 'success', '锁屏已解除')
  } catch (error) {
    addTestResult('解锁测试', 'error', `测试失败：${error}`)
  }
}

// 测试 3：Tabbar Store
async function testTabbarStore() {
  try {
    // 查看标签页列表
    console.log('标签页列表:', tabbarStore.getTabs)
    console.log('缓存的标签页:', tabbarStore.getCachedTabs)

    addTestResult(
      'Tabbar Store 测试',
      'success',
      `当前有 ${tabbarStore.getTabs.length} 个标签页，${tabbarStore.getCachedTabs.length} 个已缓存`
    )
  } catch (error) {
    addTestResult('Tabbar Store 测试', 'error', `测试失败：${error}`)
  }
}

// 添加测试标签页
async function testAddTab() {
  try {
    const testTab = {
      path: '/test-tab',
      name: 'TestTab',
      fullPath: '/test-tab',
      meta: { title: '测试标签页', keepAlive: true },
      params: {},
      query: {},
      hash: '',
      matched: [],
      redirectedFrom: undefined
    } as any

    tabbarStore.addTab(testTab)
    addTestResult('添加标签页', 'success', '测试标签页已添加')
  } catch (error) {
    addTestResult('添加标签页', 'error', `测试失败：${error}`)
  }
}

// 刷新当前标签页
async function testRefreshTab() {
  try {
    await tabbarStore.refresh(router)
    addTestResult('刷新标签页', 'success', '当前标签页已刷新')
  } catch (error) {
    addTestResult('刷新标签页', 'error', `测试失败：${error}`)
  }
}

// 测试 4：Timezone Store
async function testTimezoneStore() {
  try {
    // 查看当前时区
    console.log('当前时区:', timezoneStore.timezone)

    // 设置时区
    await timezoneStore.setTimezone('Asia/Shanghai')
    console.log('新时区:', timezoneStore.timezone)

    // 获取时区选项
    const options = await timezoneStore.getTimezoneOptions()
    console.log('时区选项:', options)

    timezoneOptions.value = options
    selectedTimezone.value = unref(timezoneStore.timezone)

    addTestResult(
      'Timezone Store 测试',
      'success',
      `当前时区：${unref(timezoneStore.timezone)}，已加载 ${options.length} 个时区选项`
    )
  } catch (error) {
    addTestResult('Timezone Store 测试', 'error', `测试失败：${error}`)
  }
}

// 加载时区选项
async function loadTimezoneOptions() {
  try {
    const options = await timezoneStore.getTimezoneOptions()
    timezoneOptions.value = options
    addTestResult('加载时区选项', 'success', `已加载 ${options.length} 个时区选项`)
  } catch (error) {
    addTestResult('加载时区选项', 'error', `加载失败：${error}`)
  }
}

// 时区改变
async function handleTimezoneChange(timezone: string) {
  try {
    await timezoneStore.setTimezone(timezone)
    addTestResult('设置时区', 'success', `时区已设置为：${timezone}`)
  } catch (error) {
    addTestResult('设置时区', 'error', `设置失败：${error}`)
  }
}

// 测试 5：持久化测试
function testPersistence() {
  try {
    // 设置一些数据
    userStore.setUserInfo({
      userId: 'persist-test',
      username: 'persist-user',
      realName: '持久化测试用户',
      avatar: '/avatar.png',
      roles: ['test']
    })

    accessStore.setAccessToken('persist-token-123')
    accessStore.setAccessCodes(['test:read'])

    addTestResult(
      '持久化测试',
      'info',
      '已设置测试数据，请刷新页面检查数据是否恢复。开发环境可查看 localStorage 中的 key'
    )
  } catch (error) {
    addTestResult('持久化测试', 'error', `测试失败：${error}`)
  }
}

// 清除所有数据
function clearAllData() {
  try {
    resetAllStores()
    testResults.value = []
    addTestResult('清除数据', 'warning', '所有 Store 数据已清除')
  } catch (error) {
    addTestResult('清除数据', 'error', `清除失败：${error}`)
  }
}

// 组件挂载时初始化
onMounted(async () => {
  // 加载时区选项
  await loadTimezoneOptions()
  selectedTimezone.value = unref(timezoneStore.timezone)

  // 检查 Pinia 是否已注册
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    addTestResult('Pinia 检查', 'success', 'Pinia 已正确注册')
  } else {
    addTestResult('Pinia 检查', 'warning', '未检测到 Vue DevTools，Pinia 可能未正确注册')
  }
})
</script>

<style scoped>
.stores-test-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.stores-test-container h2 {
  margin-bottom: 20px;
  color: #409eff;
}

.test-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-content {
  padding: 10px 0;
}

.test-content pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}

.tab-item {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.tab-item:last-child {
  border-bottom: none;
}
</style>

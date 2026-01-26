import type { ComputedRef } from 'vue'
import type { RouteLocationNormalized, Router, RouteRecordNormalized } from 'vue-router'

import type { TabDefinition } from '#/types'

import { toRaw } from 'vue'

// 从 preferences 导入配置对象
import { preferences } from '#/preferences'
// 从 shared/utils 导入工具函数（这些函数在项目的 src/shared/utils/ 中已存在）
import { openRouteInNewWindow, startProgress, stopProgress } from '#/shared/utils'

import { acceptHMRUpdate, defineStore } from 'pinia'

/**
 * 标签页状态接口
 * 定义了标签页管理相关的所有状态
 */
interface TabbarState {
  /**
   * @zh_CN 当前打开的标签页列表缓存
   * 用于 keep-alive 组件，决定哪些组件需要缓存
   */
  cachedTabs: Set<string>
  /**
   * @zh_CN 拖拽结束的索引
   * 用于标签页拖拽排序功能
   */
  dragEndIndex: number
  /**
   * @zh_CN 需要排除缓存的标签页
   * 用于刷新功能，临时排除某些标签页的缓存
   */
  excludeCachedTabs: Set<string>
  /**
   * @zh_CN 标签右键菜单列表
   * 定义标签页右键菜单的选项
   */
  menuList: string[]
  /**
   * @zh_CN 是否刷新
   * 用于控制路由视图的重新渲染
   */
  renderRouteView?: boolean
  /**
   * @zh_CN 当前打开的标签页列表
   * 存储所有打开的标签页信息
   */
  tabs: TabDefinition[]
  /**
   * @zh_CN 更新时间，用于一些更新场景，使用watch深度监听的话，会损耗性能
   * 通过更新时间触发更新，而不是深度监听整个 tabs 数组
   */
  updateTime?: number
}

/**
 * @zh_CN 标签页管理 Store
 *
 * 功能说明：
 * 1. 管理打开的标签页列表
 * 2. 管理标签页的缓存状态（用于 keep-alive）
 * 3. 提供标签页的增删改查、排序、固定等功能
 * 4. 提供标签页刷新功能
 *
 * 持久化说明：
 * - tabs：持久化到 sessionStorage，页面刷新后恢复标签页
 * - 其他字段不持久化，每次刷新后重新初始化
 *
 * 使用场景：
 * - 路由切换时自动添加标签页
 * - 关闭标签页时跳转到其他标签页
 * - 标签页右键菜单操作
 * - 标签页拖拽排序
 * - 标签页固定/取消固定
 * - 标签页刷新
 */
export const useTabbarStore = defineStore('core-tabbar', {
  /**
   * Actions：定义修改状态的方法
   */
  actions: {
    /**
     * 批量关闭标签页（内部方法）
     *
     * 功能说明：
     * 根据 key 列表批量关闭标签页，并更新缓存
     *
     * @param keys 要关闭的标签页 key 列表
     */
    async _bulkCloseByKeys(keys: string[]) {
      const keySet = new Set(keys)
      // 过滤掉要关闭的标签页
      this.tabs = this.tabs.filter((item) => !keySet.has(getTabKeyFromTab(item)))

      await this.updateCacheTabs()
    },

    /**
     * @zh_CN 关闭标签页（内部方法）
     *
     * 功能说明：
     * 关闭指定的标签页，固定标签页不能关闭
     *
     * @param tab 要关闭的标签页
     */
    _close(tab: TabDefinition) {
      // 固定标签页不能关闭
      if (isAffixTab(tab)) {
        return
      }
      const index = this.tabs.findIndex((item) => equalTab(item, tab))
      if (index !== -1) {
        this.tabs.splice(index, 1)
      }
    },

    /**
     * @zh_CN 跳转到默认标签页（内部方法）
     *
     * 功能说明：
     * 当关闭当前标签页后，跳转到第一个标签页
     *
     * @param router 路由实例
     */
    async _goToDefaultTab(router: Router) {
      if (this.getTabs.length <= 0) {
        return
      }
      const firstTab = this.getTabs[0]
      if (firstTab) {
        await this._goToTab(firstTab, router)
      }
    },

    /**
     * @zh_CN 跳转到标签页（内部方法）
     *
     * 功能说明：
     * 根据标签页信息跳转到对应路由
     *
     * @param tab 标签页对象
     * @param router 路由实例
     */
    async _goToTab(tab: TabDefinition, router: Router) {
      const { params, path, query } = tab
      const toParams = {
        params: params || {},
        path,
        query: query || {}
      }
      await router.replace(toParams)
    },

    /**
     * @zh_CN 添加标签页
     *
     * 功能说明：
     * 1. 如果标签页已存在，则更新标签页信息
     * 2. 如果标签页不存在，则添加新标签页
     * 3. 检查标签页数量限制，超过限制时关闭最早的标签页
     * 4. 更新标签页缓存
     *
     * 使用场景：
     * - 路由切换时自动调用
     * - 手动打开新标签页
     *
     * @param routeTab 路由标签页对象
     * @returns 添加或更新后的标签页对象
     */
    addTab(routeTab: TabDefinition): TabDefinition {
      let tab = cloneTab(routeTab)

      // 如果没有 key，自动生成
      if (!tab.key) {
        tab.key = getTabKey(routeTab)
      }

      // 如果标签页不应该显示，直接返回
      if (!isTabShown(tab)) {
        return tab
      }

      // 查找标签页是否已存在
      const tabIndex = this.tabs.findIndex((item) => {
        return equalTab(item, tab)
      })

      if (tabIndex === -1) {
        // 标签页不存在，添加新标签页
        const maxCount = preferences.tabbar.maxCount
        // 获取动态路由打开数，超过 0 即代表需要控制打开数
        const maxNumOfOpenTab = (routeTab?.meta?.maxNumOfOpenTab ?? -1) as number
        // 如果动态路由层级大于 0 了，那么就要限制该路由的打开数限制了
        // 获取到已经打开的动态路由数, 判断是否大于某一个值
        if (
          maxNumOfOpenTab > 0 &&
          this.tabs.filter((tab) => tab.name === routeTab.name).length >= maxNumOfOpenTab
        ) {
          // 关闭第一个同名标签页
          const index = this.tabs.findIndex((item) => item.name === routeTab.name)
          if (index !== -1) {
            this.tabs.splice(index, 1)
          }
        } else if (maxCount > 0 && this.tabs.length >= maxCount) {
          // 如果标签页数量超过限制，关闭第一个非固定标签页
          const index = this.tabs.findIndex(
            (item) => !Reflect.has(item.meta, 'affixTab') || !item.meta.affixTab
          )
          if (index !== -1) {
            this.tabs.splice(index, 1)
          }
        }
        this.tabs.push(tab)
      } else {
        // 页面已经存在，不重复添加选项卡，只更新选项卡参数
        const currentTab = toRaw(this.tabs)[tabIndex]
        const mergedTab = {
          ...currentTab,
          ...tab,
          meta: { ...currentTab?.meta, ...tab.meta }
        }
        if (currentTab) {
          const curMeta = currentTab.meta
          // 保留固定标签页属性
          if (Reflect.has(curMeta, 'affixTab')) {
            mergedTab.meta.affixTab = curMeta.affixTab
          }
          // 保留自定义标题属性
          if (Reflect.has(curMeta, 'newTabTitle')) {
            mergedTab.meta.newTabTitle = curMeta.newTabTitle
          }
        }
        tab = mergedTab
        this.tabs.splice(tabIndex, 1, mergedTab)
      }
      this.updateCacheTabs()
      return tab
    },

    /**
     * @zh_CN 关闭所有标签页
     *
     * 功能说明：
     * 关闭所有非固定标签页，保留固定标签页
     * 如果没有固定标签页，则保留第一个标签页
     *
     * @param router 路由实例
     */
    async closeAllTabs(router: Router) {
      const newTabs = this.tabs.filter((tab) => isAffixTab(tab))
      this.tabs = newTabs.length > 0 ? newTabs : [...this.tabs].splice(0, 1)
      await this._goToDefaultTab(router)
      this.updateCacheTabs()
    },

    /**
     * @zh_CN 关闭左侧标签页
     *
     * 功能说明：
     * 关闭指定标签页左侧的所有非固定标签页
     *
     * @param tab 参考标签页
     */
    async closeLeftTabs(tab: TabDefinition) {
      const index = this.tabs.findIndex((item) => equalTab(item, tab))

      if (index < 1) {
        return
      }

      const leftTabs = this.tabs.slice(0, index)
      const keys: string[] = []

      for (const item of leftTabs) {
        if (!isAffixTab(item)) {
          keys.push(item.key as string)
        }
      }
      await this._bulkCloseByKeys(keys)
    },

    /**
     * @zh_CN 关闭其他标签页
     *
     * 功能说明：
     * 关闭除指定标签页外的所有非固定标签页
     *
     * @param tab 参考标签页
     */
    async closeOtherTabs(tab: TabDefinition) {
      const closeKeys = this.tabs.map((item) => getTabKeyFromTab(item))

      const keys: string[] = []

      for (const key of closeKeys) {
        if (key !== getTabKeyFromTab(tab)) {
          const closeTab = this.tabs.find((item) => getTabKeyFromTab(item) === key)
          if (!closeTab) {
            continue
          }
          if (!isAffixTab(closeTab)) {
            keys.push(closeTab.key as string)
          }
        }
      }
      await this._bulkCloseByKeys(keys)
    },

    /**
     * @zh_CN 关闭右侧标签页
     *
     * 功能说明：
     * 关闭指定标签页右侧的所有非固定标签页
     *
     * @param tab 参考标签页
     */
    async closeRightTabs(tab: TabDefinition) {
      const index = this.tabs.findIndex((item) => equalTab(item, tab))

      if (index !== -1 && index < this.tabs.length - 1) {
        const rightTabs = this.tabs.slice(index + 1)

        const keys: string[] = []
        for (const item of rightTabs) {
          if (!isAffixTab(item)) {
            keys.push(item.key as string)
          }
        }
        await this._bulkCloseByKeys(keys)
      }
    },

    /**
     * @zh_CN 关闭标签页
     *
     * 功能说明：
     * 1. 如果关闭的不是当前激活标签页，直接关闭
     * 2. 如果关闭的是当前激活标签页，关闭后跳转到相邻标签页
     *
     * @param tab 要关闭的标签页
     * @param router 路由实例
     */
    async closeTab(tab: TabDefinition, router: Router) {
      const { currentRoute } = router
      // 关闭不是激活选项卡
      if (getTabKey(currentRoute.value) !== getTabKeyFromTab(tab)) {
        this._close(tab)
        this.updateCacheTabs()
        return
      }
      const index = this.getTabs.findIndex(
        (item) => getTabKeyFromTab(item) === getTabKey(currentRoute.value)
      )

      const before = this.getTabs[index - 1]
      const after = this.getTabs[index + 1]

      // 下一个tab存在，跳转到下一个
      if (after) {
        this._close(tab)
        await this._goToTab(after, router)
        // 上一个tab存在，跳转到上一个
      } else if (before) {
        this._close(tab)
        await this._goToTab(before, router)
      } else {
        console.error('Failed to close the tab; only one tab remains open.')
      }
    },

    /**
     * @zh_CN 通过key关闭标签页
     *
     * 功能说明：
     * 根据标签页 key 关闭标签页
     *
     * @param key 标签页 key
     * @param router 路由实例
     */
    async closeTabByKey(key: string, router: Router) {
      const originKey = decodeURIComponent(key)
      const index = this.tabs.findIndex((item) => getTabKeyFromTab(item) === originKey)
      if (index === -1) {
        return
      }

      const tab = this.tabs[index]
      if (tab) {
        await this.closeTab(tab, router)
      }
    },

    /**
     * 根据tab的key获取tab
     *
     * 功能说明：
     * 根据 key 查找标签页对象
     *
     * @param key 标签页 key
     * @returns 找到的标签页对象
     */
    getTabByKey(key: string) {
      return this.getTabs.find((item) => getTabKeyFromTab(item) === key) as TabDefinition
    },

    /**
     * @zh_CN 新窗口打开标签页
     *
     * 功能说明：
     * 在新浏览器窗口中打开标签页对应的路由
     *
     * @param tab 标签页对象
     */
    async openTabInNewWindow(tab: TabDefinition) {
      openRouteInNewWindow(tab.fullPath || tab.path)
    },

    /**
     * @zh_CN 固定标签页
     *
     * 功能说明：
     * 将标签页固定，固定标签页不能关闭，且会排在前面
     *
     * @param tab 要固定的标签页
     */
    async pinTab(tab: TabDefinition) {
      const index = this.tabs.findIndex((item) => equalTab(item, tab))
      if (index === -1) {
        return
      }
      const oldTab = this.tabs[index]
      tab.meta.affixTab = true
      tab.meta.title = oldTab?.meta?.title as string
      this.tabs.splice(index, 1, tab)
      // 过滤固定tabs，后面更改affixTabOrder的值的话可能会有问题，目前行464排序affixTabs没有设置值
      const affixTabs = this.tabs.filter((tab) => isAffixTab(tab))
      // 获得固定tabs的index
      const newIndex = affixTabs.findIndex((item) => equalTab(item, tab))
      // 交换位置重新排序
      await this.sortTabs(index, newIndex)
    },

    /**
     * 刷新标签页
     *
     * 功能说明：
     * 1. 如果参数是 Router，刷新当前路由对应的标签页
     * 2. 如果参数是 string，刷新指定名称的标签页
     *
     * 刷新原理：
     * 1. 将标签页从缓存中排除
     * 2. 隐藏路由视图
     * 3. 显示进度条
     * 4. 等待 200ms 后恢复缓存和视图
     *
     * @param router 路由实例或路由名称
     */
    async refresh(router: Router | string) {
      // 如果是Router路由，那么就根据当前路由刷新
      // 如果是string字符串，为路由名称，则定向刷新指定标签页，不能是当前路由名称，否则不会刷新
      if (typeof router === 'string') {
        return await this.refreshByName(router)
      }

      const { currentRoute } = router
      const { name } = currentRoute.value

      this.excludeCachedTabs.add(name as string)
      this.renderRouteView = false
      startProgress()

      await new Promise((resolve) => setTimeout(resolve, 200))

      this.excludeCachedTabs.delete(name as string)
      this.renderRouteView = true
      stopProgress()
    },

    /**
     * 根据路由名称刷新指定标签页
     *
     * 功能说明：
     * 刷新指定名称的标签页，用于刷新非当前标签页
     *
     * @param name 路由名称
     */
    async refreshByName(name: string) {
      this.excludeCachedTabs.add(name)
      await new Promise((resolve) => setTimeout(resolve, 200))
      this.excludeCachedTabs.delete(name)
    },

    /**
     * @zh_CN 重置标签页标题
     *
     * 功能说明：
     * 清除标签页的自定义标题，恢复为默认标题
     *
     * @param tab 标签页对象
     */
    async resetTabTitle(tab: TabDefinition) {
      if (tab?.meta?.newTabTitle) {
        return
      }
      const findTab = this.tabs.find((item) => equalTab(item, tab))
      if (findTab) {
        findTab.meta.newTabTitle = undefined
        await this.updateCacheTabs()
      }
    },

    /**
     * 设置固定标签页
     *
     * 功能说明：
     * 批量设置固定标签页，通常用于初始化时设置首页等固定标签页
     *
     * @param tabs 路由记录数组
     */
    setAffixTabs(tabs: RouteRecordNormalized[]) {
      for (const tab of tabs) {
        tab.meta.affixTab = true
        this.addTab(routeToTab(tab))
      }
    },

    /**
     * @zh_CN 更新菜单列表
     *
     * 功能说明：
     * 设置标签页右键菜单的选项列表
     *
     * @param list 菜单选项列表
     */
    setMenuList(list: string[]) {
      this.menuList = list
    },

    /**
     * @zh_CN 设置标签页标题
     *
     * 功能说明：
     * 支持设置静态标题字符串或计算属性作为动态标题
     * 当标题为计算属性时,标题会随计算属性值变化而自动更新
     * 适用于需要根据状态或多语言动态更新标题的场景
     *
     * @param {TabDefinition} tab - 标签页对象
     * @param {ComputedRef<string> | string} title - 标题内容,支持静态字符串或计算属性
     *
     * @example
     * // 设置静态标题
     * setTabTitle(tab, '新标签页');
     *
     * @example
     * // 设置动态标题
     * setTabTitle(tab, computed(() => t('common.dashboard')));
     */
    async setTabTitle(tab: TabDefinition, title: ComputedRef<string> | string) {
      const findTab = this.tabs.find((item) => equalTab(item, tab))

      if (findTab) {
        findTab.meta.newTabTitle = title

        await this.updateCacheTabs()
      }
    },

    /**
     * 设置更新时间
     *
     * 功能说明：
     * 手动触发更新时间，用于强制更新依赖 updateTime 的组件
     */
    setUpdateTime() {
      this.updateTime = Date.now()
    },

    /**
     * @zh_CN 设置标签页顺序
     *
     * 功能说明：
     * 通过拖拽改变标签页的顺序
     *
     * @param oldIndex 原索引
     * @param newIndex 新索引
     */
    async sortTabs(oldIndex: number, newIndex: number) {
      const currentTab = this.tabs[oldIndex]
      if (!currentTab) {
        return
      }
      this.tabs.splice(oldIndex, 1)
      this.tabs.splice(newIndex, 0, currentTab)
      this.dragEndIndex = this.dragEndIndex + 1
    },

    /**
     * @zh_CN 切换固定标签页
     *
     * 功能说明：
     * 如果标签页已固定，则取消固定；如果未固定，则固定
     *
     * @param tab 标签页对象
     */
    async toggleTabPin(tab: TabDefinition) {
      const affixTab = tab?.meta?.affixTab ?? false

      await (affixTab ? this.unpinTab(tab) : this.pinTab(tab))
    },

    /**
     * @zh_CN 取消固定标签页
     *
     * 功能说明：
     * 取消标签页的固定状态，标签页会移动到非固定标签页区域
     *
     * @param tab 要取消固定的标签页
     */
    async unpinTab(tab: TabDefinition) {
      const index = this.tabs.findIndex((item) => equalTab(item, tab))
      if (index === -1) {
        return
      }
      const oldTab = this.tabs[index]
      tab.meta.affixTab = false
      tab.meta.title = oldTab?.meta?.title as string
      this.tabs.splice(index, 1, tab)
      // 过滤固定tabs，后面更改affixTabOrder的值的话可能会有问题，目前行464排序affixTabs没有设置值
      const affixTabs = this.tabs.filter((tab) => isAffixTab(tab))
      // 获得固定tabs的index,使用固定tabs的下一个位置也就是活动tabs的第一个位置
      const newIndex = affixTabs.length
      // 交换位置重新排序
      await this.sortTabs(index, newIndex)
    },

    /**
     * 根据当前打开的选项卡更新缓存
     *
     * 功能说明：
     * 根据当前打开的标签页，更新需要缓存的组件名称列表
     * 用于 keep-alive 组件的 include 属性
     *
     * 缓存规则：
     * 1. 只缓存设置了 keepAlive: true 的标签页
     * 2. 缓存标签页本身及其所有父级路由组件
     */
    async updateCacheTabs() {
      const cacheMap = new Set<string>()

      for (const tab of this.tabs) {
        // 跳过不需要持久化的标签页
        const keepAlive = tab.meta?.keepAlive
        if (!keepAlive) {
          continue
        }
        // 缓存所有父级路由组件
        ;(tab.matched || []).forEach((t, i) => {
          if (i > 0) {
            cacheMap.add(t.name as string)
          }
        })

        const name = tab.name as string
        cacheMap.add(name)
      }
      this.cachedTabs = cacheMap
    }
  },

  /**
   * Getters：定义计算属性
   */
  getters: {
    /**
     * 获取固定标签页列表
     *
     * 功能说明：
     * 返回所有固定标签页，并按 affixTabOrder 排序
     */
    affixTabs(): TabDefinition[] {
      const affixTabs = this.tabs.filter((tab) => isAffixTab(tab))

      return affixTabs.toSorted((a, b) => {
        const orderA = (a.meta?.affixTabOrder ?? 0) as number
        const orderB = (b.meta?.affixTabOrder ?? 0) as number
        return orderA - orderB
      })
    },

    /**
     * 获取缓存的标签页名称列表
     *
     * 功能说明：
     * 返回需要缓存的组件名称数组，用于 keep-alive 的 include 属性
     */
    getCachedTabs(): string[] {
      return [...this.cachedTabs]
    },

    /**
     * 获取排除缓存的标签页名称列表
     *
     * 功能说明：
     * 返回需要排除缓存的组件名称数组，用于 keep-alive 的 exclude 属性
     */
    getExcludeCachedTabs(): string[] {
      return [...this.excludeCachedTabs]
    },

    /**
     * 获取菜单列表
     */
    getMenuList(): string[] {
      return this.menuList
    },

    /**
     * 获取所有标签页（固定标签页在前）
     *
     * 功能说明：
     * 返回所有标签页，固定标签页排在前面，非固定标签页排在后面
     */
    getTabs(): TabDefinition[] {
      const normalTabs = this.tabs.filter((tab) => !isAffixTab(tab))
      return [...this.affixTabs, ...normalTabs].filter(Boolean)
    }
  },

  /**
   * 持久化配置
   * tabs 持久化到 sessionStorage，页面刷新后恢复标签页
   */
  persist: [
    // tabs不需要保存在localStorage
    {
      pick: ['tabs'],
      storage: sessionStorage
    }
  ],

  /**
   * State：定义 Store 的初始状态
   */
  state: (): TabbarState => ({
    cachedTabs: new Set(),
    dragEndIndex: 0,
    excludeCachedTabs: new Set(),
    menuList: [
      'close',
      'affix',
      'maximize',
      'reload',
      'open-in-new-window',
      'close-left',
      'close-right',
      'close-other',
      'close-all'
    ],
    renderRouteView: true,
    tabs: [],
    updateTime: Date.now()
  })
})

// 解决热更新问题
const hot = import.meta.hot
if (hot) {
  hot.accept(acceptHMRUpdate(useTabbarStore, hot))
}

/**
 * @zh_CN 克隆路由,防止路由被修改
 *
 * 功能说明：
 * 深拷贝路由对象，避免直接修改原始路由对象
 *
 * @param route 路由对象
 * @returns 克隆后的路由对象
 */
function cloneTab(route: TabDefinition): TabDefinition {
  if (!route) {
    return route
  }
  const { matched, meta, ...opt } = route
  return {
    ...opt,
    matched: (matched
      ? matched.map((item) => ({
          meta: item.meta,
          name: item.name,
          path: item.path
        }))
      : undefined) as RouteRecordNormalized[],
    meta: {
      ...meta,
      newTabTitle: meta.newTabTitle
    }
  }
}

/**
 * @zh_CN 是否是固定标签页
 *
 * 功能说明：
 * 判断标签页是否被固定
 *
 * @param tab 标签页对象
 * @returns 是否是固定标签页
 */
function isAffixTab(tab: TabDefinition) {
  return tab?.meta?.affixTab ?? false
}

/**
 * @zh_CN 是否显示标签
 *
 * 功能说明：
 * 判断标签页是否应该显示
 * 如果标签页或其父级路由设置了 hideInTab，则不显示
 *
 * @param tab 标签页对象
 * @returns 是否显示
 */
function isTabShown(tab: TabDefinition) {
  const matched = tab?.matched ?? []
  return !tab.meta.hideInTab && matched.every((item) => !item.meta.hideInTab)
}

/**
 * 从route获取tab页的key
 *
 * 功能说明：
 * 根据路由信息生成标签页的唯一 key
 *
 * key 生成规则：
 * 1. 如果路由 query 中有 pageKey，使用 pageKey
 * 2. 如果路由 meta 中 fullPathKey 为 false，使用 path
 * 3. 否则使用 fullPath
 *
 * @param tab 路由对象
 * @returns 标签页 key
 */
function getTabKey(tab: RouteLocationNormalized | RouteRecordNormalized) {
  const { fullPath, path, meta: { fullPathKey } = {}, query = {} } = tab as RouteLocationNormalized
  // pageKey可能是数组（查询参数重复时可能出现）
  const pageKey = Array.isArray(query.pageKey) ? query.pageKey[0] : query.pageKey
  let rawKey
  if (pageKey) {
    rawKey = pageKey
  } else {
    rawKey = fullPathKey === false ? path : (fullPath ?? path)
  }
  try {
    return decodeURIComponent(rawKey)
  } catch {
    return rawKey
  }
}

/**
 * 从tab获取tab页的key
 *
 * 功能说明：
 * 如果tab没有key,那么就从route获取key
 *
 * @param tab 标签页对象
 * @returns 标签页 key
 */
function getTabKeyFromTab(tab: TabDefinition): string {
  return tab.key ?? getTabKey(tab)
}

/**
 * 比较两个tab是否相等
 *
 * 功能说明：
 * 通过比较 key 判断两个标签页是否相同
 *
 * @param a 标签页 A
 * @param b 标签页 B
 * @returns 是否相等
 */
function equalTab(a: TabDefinition, b: TabDefinition) {
  return getTabKeyFromTab(a) === getTabKeyFromTab(b)
}

/**
 * 将路由记录转换为标签页对象
 *
 * 功能说明：
 * 从路由记录中提取标签页所需的信息
 *
 * @param route 路由记录
 * @returns 标签页对象
 */
function routeToTab(route: RouteRecordNormalized) {
  return {
    meta: route.meta,
    name: route.name,
    path: route.path,
    key: getTabKey(route)
  } as TabDefinition
}

export { getTabKey }

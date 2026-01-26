// https://github.com/vuejs/pinia/issues/2098
/**
 * Pinia HMR 类型声明
 * 用于解决 Pinia 在开发环境下的热更新问题
 * 当使用 Vite HMR 时，需要这个类型声明来支持 acceptHMRUpdate 函数
 */
declare module 'pinia' {
  export function acceptHMRUpdate(
    initialUseStore: any | StoreDefinition,
    hot: any,
  ): (newModule: any) => any;
}

export { acceptHMRUpdate };

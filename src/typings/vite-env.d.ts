/// <reference types="vite/client" />

// PWA 插件虚拟模块声明
// virtual:generated-pages / virtual:svg-icons-register 已在 src/shims-vue.d.ts 中声明，此处不重复

declare module 'virtual:pwa-register' {
  import type { RegisterSWOptions } from 'vite-plugin-pwa/types'

  export type { RegisterSWOptions }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>
}

declare module 'virtual:pwa-register/vue' {
  import type { RegisterSWOptions } from 'vite-plugin-pwa/types'
  import type { Ref } from 'vue'

  export type { RegisterSWOptions }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: Ref<boolean>
    offlineReady: Ref<boolean>
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }
}

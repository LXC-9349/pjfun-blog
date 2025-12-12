declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}
declare module 'virtual:generated-pages' {
    import type { RouteRecordRaw } from 'vue-router'
    const routes: RouteRecordRaw[]
    export default routes
}

declare module 'virtual:article-routes' {
    import type { RouteRecordRaw } from 'vue-router'
    export const articleRoutes: RouteRecordRaw[]
}

declare module 'virtual:svg-icons-register' {
    const content: string
    export default content
}
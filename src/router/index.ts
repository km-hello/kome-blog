import { watch } from 'vue'
import type { Ref } from 'vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import i18n from '@/i18n'

/**
 * 页面级自定义标题。
 * 用于文章详情这类异步数据页，在数据返回后覆盖路由默认标题。
 */
let customDocumentTitle: string | null = null

/**
 * 路由配置表。
 *
 * 路由结构：
 *   /              → Home      首页（文章列表）
 *   /archive       → Archive   归档（按年月分组）
 *   /memos         → Memos     动态列表
 *   /links         → Links     友情链接
 *   /guestbook     → Guestbook 留言本
 *   /about         → About     关于页
 *   /post/:slug    → PostDetail 文章详情
 *   /preview       → Preview   管理端文章预览（iframe 接收端）
 *   /*             → NotFound  404 页面
 */
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: 'Home' },
    },
    {
        path: '/archive',
        name: 'Archive',
        component: () => import('@/views/Archive.vue'),
        meta: { title: 'Archive' },
    },
    {
        path: '/memos',
        name: 'Memos',
        component: () => import('@/views/Memos.vue'),
        meta: { title: 'Memos' },
    },
    {
        path: '/links',
        name: 'Links',
        component: () => import('@/views/Links.vue'),
        meta: { title: 'Links' },
    },
    {
        path: '/guestbook',
        name: 'Guestbook',
        component: () => import('@/views/Guestbook.vue'),
        meta: { title: 'Guestbook' },
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('@/views/About.vue'),
        meta: { title: 'About' },
    },
    {
        path: '/post/:slug',
        name: 'PostDetail',
        component: () => import('@/views/PostDetail.vue'),
        meta: { title: 'Post' },
    },
    {
        path: '/preview',
        name: 'Preview',
        component: () => import('@/views/Preview.vue'),
        meta: { title: 'Preview' },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue'),
        meta: { title: '404' },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    // 滚动行为：若有历史位置则恢复，否则回到顶部
    scrollBehavior(_to, _from, savedPosition) {
        return savedPosition ?? { top: 0 }
    },
})


function resolveRouteTitle(title?: string) {
    if (!title) return ''

    const titleKey = `nav.${title.toLowerCase()}`
    const translated = i18n.global.t(titleKey)
    return translated !== titleKey ? translated : title
}

/**
 * 组合最终页面标题。
 * 优先使用页面主动设置的标题，否则回退到路由 meta.title。
 */
function syncDocumentTitle(routeTitle?: string) {
    const title = customDocumentTitle || resolveRouteTitle(routeTitle)
    document.title = title
        ? `${title} - ${i18n.global.t('brand.blogName')}`
        : i18n.global.t('brand.blogName')
}

/**
 * 设置页面级自定义标题。
 * 供文章详情这类异步页面在数据加载后同步浏览器标题。
 *
 * @param title 页面标题；为空时清除自定义标题。
 */
export function setCustomDocumentTitle(title?: string | null) {
    customDocumentTitle = title?.trim() || null
    syncDocumentTitle(router.currentRoute.value.meta.title as string | undefined)
}

/**
 * 路由后置守卫：根据路由 meta.title 动态设置页面标题
 */
router.afterEach((to) => {
    customDocumentTitle = null
    syncDocumentTitle(to.meta.title as string)
})

/**
 * 监听语言切换：实时更新当前页面标题（不依赖路由跳转）
 */
const localeRef = i18n.global.locale as unknown as Ref<string>
watch(localeRef, () => {
    syncDocumentTitle(router.currentRoute.value.meta.title as string)
})

export default router

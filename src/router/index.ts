import { watch } from 'vue'
import type { Ref } from 'vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import i18n from '@/i18n'

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

/**
 * 根据路由 meta.title 和当前语言设置页面标题。
 * 将 meta.title 转为 nav.{title} 翻译键，翻译失败时回退到原始英文值。
 */
function updateDocumentTitle(title?: string) {
    if (title) {
        const titleKey = `nav.${title.toLowerCase()}`
        const translated = i18n.global.t(titleKey)
        document.title = `${translated !== titleKey ? translated : title} - ${i18n.global.t('brand.blogName')}`
    } else {
        document.title = i18n.global.t('brand.blogName')
    }
}

/**
 * 路由后置守卫：根据路由 meta.title 动态设置页面标题
 */
router.afterEach((to) => {
    updateDocumentTitle(to.meta.title as string)
})

/**
 * 监听语言切换：实时更新当前页面标题（不依赖路由跳转）
 */
const localeRef = i18n.global.locale as unknown as Ref<string>
watch(localeRef, () => {
    const currentTitle = router.currentRoute.value.meta.title as string
    updateDocumentTitle(currentTitle)
})

export default router
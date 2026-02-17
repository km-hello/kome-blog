import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

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
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(_to, _from, savedPosition) {
        return savedPosition ?? { top: 0 }
    },
})

router.afterEach((to) => {
    const title = to.meta.title as string
    document.title = title ? `${title} - Kome Blog` : 'Kome Blog'
})

export default router
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' },
    },
    {
        path: '/archive',
        name: 'Archive',
        component: () => import('@/views/Archive.vue'),
        meta: { title: '归档' },
    },
    {
        path: '/memos',
        name: 'Memos',
        component: () => import('@/views/Memos.vue'),
        meta: { title: '随记' },
    },
    {
        path: '/links',
        name: 'Links',
        component: () => import('@/views/Links.vue'),
        meta: { title: '友链' },
    },
    {
        path: '/post/:slug',
        name: 'PostDetail',
        component: () => import('@/views/PostDetail.vue'),
        meta: { title: '文章' },
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('@/views/About.vue'),
        meta: { title: '关于' },
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
    document.title = title ? `${title} | Kome Blog` : 'Kome Blog'
})

export default router
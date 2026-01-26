import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(_to, _from, savedPosition) {
        return savedPosition ?? { top: 0 };
    },
});

// 动态设置页面标题
router.afterEach((to) => {
    const title = to.meta.title as string;
    document.title = title ? `${title} | Kome Blog` : 'Kome Blog';
});

export default router;
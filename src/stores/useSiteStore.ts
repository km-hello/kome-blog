import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getSiteInfoApi, type SiteInfoResponse } from '@/api/site';

/**
 * 站点信息的全局状态存储。
 *
 * 每次路由切换时重新请求最新数据，保证前台及时反映后台变更。
 * 同一次导航中多个组件同时调用时，通过 Promise 去重确保只发起一次请求。
 */
export const useSiteStore = defineStore('site', () => {
    // ========== State ==========

    /** 站点信息（包含站长资料与统计数据） */
    const siteInfo = ref<SiteInfoResponse | null>(null);

    /** 是否正在加载中 */
    const loading = ref(false);

    /** 当前正在进行的请求 Promise，用于并发去重 */
    let pendingPromise: Promise<void> | null = null;


    // ========== Actions ==========

    /**
     * 获取站点信息
     *
     * - 每次调用都会发起请求，确保数据实时
     * - 已有请求进行中时复用同一 Promise，避免并发重复请求
     */
    const fetchSiteInfo = async (): Promise<void> => {
        // 已有请求进行中，复用同一 Promise
        if (pendingPromise) return pendingPromise;

        pendingPromise = getSiteInfoApi()
            .then(res => {
                siteInfo.value = res;
            })
            .finally(() => {
                pendingPromise = null;
            });

        loading.value = true;
        try {
            await pendingPromise;
        } finally {
            loading.value = false;
        }
    };


    // ========== Return ==========

    return {
        // State
        siteInfo,
        loading,

        // Actions
        fetchSiteInfo,
    };
});

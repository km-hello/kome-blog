import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getSiteInfoApi, type SiteInfoResponse } from '@/api/site';

/** 缓存过期时间：5 分钟 */
const CACHE_TTL = 5 * 60 * 1000;

/**
 * 站点信息的全局状态存储。
 *
 * 将 siteInfo 提升为全局缓存，避免多个页面重复请求同一接口。
 * 首次请求后缓存数据，在 TTL 内复用；并发调用时通过 Promise 去重，确保只发起一次请求。
 */
export const useSiteStore = defineStore('site', () => {
    // ========== State ==========

    /** 站点信息（包含站长资料与统计数据） */
    const siteInfo = ref<SiteInfoResponse | null>(null);

    /** 是否正在加载中 */
    const loading = ref(false);

    /** 上次成功获取数据的时间戳 */
    let lastFetchTime = 0;

    /** 当前正在进行的请求 Promise，用于并发去重 */
    let pendingPromise: Promise<void> | null = null;


    // ========== Actions ==========

    /**
     * 获取站点信息（带缓存）
     *
     * - 缓存未过期时直接返回，不发起请求
     * - 已有请求进行中时复用同一 Promise，避免并发重复请求
     * - 缓存过期后重新请求并更新数据
     */
    const fetchSiteInfo = async (): Promise<void> => {
        // 缓存有效，直接跳过
        if (siteInfo.value && Date.now() - lastFetchTime < CACHE_TTL) return;

        // 已有请求进行中，复用同一 Promise
        if (pendingPromise) return pendingPromise;

        pendingPromise = getSiteInfoApi()
            .then(res => {
                siteInfo.value = res;
                lastFetchTime = Date.now();
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

<!-- Guestbook.vue - 留言本（Giscus 评论） -->
<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import Giscus from '@giscus/vue'
import AppHeader from '@/components/common/AppHeader.vue'
import ProfileCard from '@/components/sidebar/ProfileCard.vue'
import ProfileCardSkeleton from '@/components/skeleton/ProfileCardSkeleton.vue'
import SetupHint from '@/components/sidebar/SetupHint.vue'
import SiteFooter from '@/components/sidebar/SiteFooter.vue'
import PageTitleCard from '@/components/common/PageTitleCard.vue'
import GiscusSkeleton from '@/components/skeleton/GiscusSkeleton.vue'
import {useSiteStore} from '@/stores/useSiteStore'
import {useSidebarDrawer} from '@/composables/useSidebarDrawer'

const siteStore = useSiteStore()
const {isLg} = useSidebarDrawer()
const {t, locale} = useI18n()

/**
 * Giscus 配置
 */
const giscusRepo = ref('')
const giscusRepoId = ref('')
const giscusCategory = ref('')
const giscusCategoryId = ref('')

/**
 * 是否已配置所有必需参数
 */
const isConfigured = computed(() =>
    giscusRepo.value && giscusRepoId.value && giscusCategory.value && giscusCategoryId.value
)

/**
 * 是否可以渲染 Giscus 组件
 * 需要同时满足：站点信息已初始化 && Giscus 配置完整
 */
const canRenderGiscus = computed(() =>
    siteStore.initialized === true && isConfigured.value
)

/**
 * Giscus 语言映射
 */
const giscusLang = computed(() => locale.value === 'zh-CN' ? 'zh-CN' : 'en')

/**
 * Giscus 容器引用（用于查找 shadow DOM 中的 iframe）
 */
const giscusRootRef = ref<HTMLElement | null>(null)

/**
 * Giscus 是否已加载完成
 */
const giscusLoaded = ref(false)

/**
 * 定时器：轮询绑定 Giscus iframe 加载事件
 */
let giscusBindTimer: number | null = null

/**
 * 是否已绑定加载事件（防止重复绑定）
 */
let hasBindLoadEvent = false

/**
 * 清除定时器
 */
const clearGiscusBindTimer = () => {
  if (giscusBindTimer !== null) {
    window.clearInterval(giscusBindTimer)
    giscusBindTimer = null
  }
}

/**
 * 绑定 Giscus iframe 加载事件
 * @returns 是否成功找到并绑定 iframe
 */
const bindGiscusLoadEvent = (): boolean => {
  const widget = giscusRootRef.value?.querySelector('giscus-widget')
  const iframe = widget?.shadowRoot?.querySelector('iframe')
  if (!iframe) return false

  // iframe 已加载完成
  if (!iframe.classList.contains('loading')) {
    giscusLoaded.value = true
    return true
  }

  // 防止重复绑定
  if (hasBindLoadEvent) return true

  // 监听 iframe 加载完成事件
  iframe.addEventListener('load', () => {
    giscusLoaded.value = true
  }, {once: true})

  hasBindLoadEvent = true
  return true
}

/**
 * 监听 Giscus 可渲染状态，自动绑定加载事件
 */
watch(canRenderGiscus, async (enabled) => {
  clearGiscusBindTimer()
  giscusLoaded.value = false
  hasBindLoadEvent = false
  if (!enabled) return

  await nextTick()
  if (bindGiscusLoadEvent()) return

  // 轮询查找 iframe（最多 6 秒，每 200ms 一次）
  let attempts = 0
  const maxAttempts = 30
  giscusBindTimer = window.setInterval(() => {
    attempts += 1
    if (bindGiscusLoadEvent()) {
      clearGiscusBindTimer()
    } else if (attempts >= maxAttempts) {
      // 超时降级：隐藏骨架屏，显示 Giscus（即使可能还在加载）
      clearGiscusBindTimer()
      giscusLoaded.value = true
    }
  }, 200)
}, {immediate: true})

onBeforeUnmount(() => {
  clearGiscusBindTimer()
})

onMounted(async () => {
  await siteStore.fetchSiteInfo()
  if (siteStore.initialized !== true) return

  // 优先从 /config.json（生产环境 Docker 挂载）加载
  try {
    const res = await fetch('/config.json')
    if (res.ok) {
      const config = await res.json()
      giscusRepo.value = config.GISCUS_REPO || ''
      giscusRepoId.value = config.GISCUS_REPO_ID || ''
      giscusCategory.value = config.GISCUS_CATEGORY || ''
      giscusCategoryId.value = config.GISCUS_CATEGORY_ID || ''
    }
  } catch {
    // fetch 失败时静默忽略
  }

  // 开发环境回退：从 Vite 环境变量读取
  if (!isConfigured.value) {
    giscusRepo.value = giscusRepo.value || import.meta.env.VITE_GISCUS_REPO || ''
    giscusRepoId.value = giscusRepoId.value || import.meta.env.VITE_GISCUS_REPO_ID || ''
    giscusCategory.value = giscusCategory.value || import.meta.env.VITE_GISCUS_CATEGORY || ''
    giscusCategoryId.value = giscusCategoryId.value || import.meta.env.VITE_GISCUS_CATEGORY_ID || ''
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader/>

    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- 主内容区（>= lg 占 8 栏） -->
      <main class="lg:col-span-8 flex flex-col gap-6">
        <PageTitleCard
            :title="t('guestbook.title')"
            :subtitle="t('guestbook.subtitle')"
        />

        <!-- Giscus 评论组件 -->
        <div v-if="canRenderGiscus" class="bento-card p-6">
          <!-- 容器：最小高度确保骨架屏显示空间 -->
          <div class="relative min-h-24">
            <!-- 骨架屏：加载时覆盖显示 -->
            <div v-if="!giscusLoaded" class="absolute inset-0 z-10 pointer-events-none">
              <GiscusSkeleton />
            </div>

            <!-- Giscus 组件：加载完成前透明 -->
            <div ref="giscusRootRef" :class="{'opacity-0': !giscusLoaded}" class="transition-opacity duration-300">
              <Giscus
                :repo="giscusRepo as `${string}/${string}`"
                :repo-id="giscusRepoId"
                :category="giscusCategory"
                :category-id="giscusCategoryId"
                mapping="pathname"
                input-position="top"
                reactions-enabled="1"
                loading="lazy"
                theme="light"
                :lang="giscusLang"
              />
            </div>
          </div>
        </div>

        <!-- 不可用提示（未初始化或未完成 Giscus 配置） -->
        <div v-else class="text-center py-16 text-sm text-slate-400">
          {{ t('guestbook.notConfigured') }}
        </div>
      </main>

      <!-- 侧边栏（< lg Teleport 至抽屉 / >= lg sticky 右侧） -->
      <aside class="lg:col-span-4 relative">
        <Teleport to="#sidebar-drawer-content" :disabled="isLg">
          <div class="sticky top-24 space-y-5">
            <ProfileCard v-if="siteStore.siteInfo" :owner="siteStore.siteInfo.owner" :stats="siteStore.siteInfo.stats"/>
            <SetupHint v-else-if="siteStore.initialized === false"/>
            <ProfileCardSkeleton v-else/>

            <SiteFooter/>
          </div>
        </Teleport>
      </aside>
    </div>
  </div>
</template>

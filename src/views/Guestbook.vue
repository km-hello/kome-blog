<!-- Guestbook.vue - 留言本（Giscus 评论） -->
<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import Giscus from '@giscus/vue'
import AppHeader from '@/components/common/AppHeader.vue'
import ProfileCard from '@/components/sidebar/ProfileCard.vue'
import ProfileCardSkeleton from '@/components/skeleton/ProfileCardSkeleton.vue'
import SetupHint from '@/components/sidebar/SetupHint.vue'
import SiteFooter from '@/components/sidebar/SiteFooter.vue'
import PageTitleCard from '@/components/common/PageTitleCard.vue'
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
 * Giscus 语言映射
 */
const giscusLang = computed(() => locale.value === 'zh-CN' ? 'zh-CN' : 'en')

onMounted(async () => {
  await siteStore.fetchSiteInfo()

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
        <div v-if="isConfigured" class="bento-card p-6">
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

        <!-- 未配置提示 -->
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

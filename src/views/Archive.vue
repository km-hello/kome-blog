<!-- Archive.vue - 文章归档页 -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/common/AppHeader.vue'
import ArchiveSkeleton from '@/components/skeleton/ArchiveSkeleton.vue'
import ProfileCard from '@/components/sidebar/ProfileCard.vue'
import ProfileCardSkeleton from '@/components/skeleton/ProfileCardSkeleton.vue'
import SetupHint from '@/components/sidebar/SetupHint.vue'
import SearchBox from '@/components/sidebar/SearchBox.vue'
import TagList from '@/components/sidebar/TagList.vue'
import TimelineNav from '@/components/sidebar/TimelineNav.vue'
import TimelineNavSkeleton from '@/components/skeleton/TimelineNavSkeleton.vue'
import SiteFooter from '@/components/sidebar/SiteFooter.vue'
import PageTitleCard from '@/components/common/PageTitleCard.vue'

import { getArchivePostsApi, type PostArchiveResponse } from '@/api/post'
import { getTagsApi, type TagPostCountResponse } from '@/api/tag'
import { useSiteStore } from '@/stores/useSiteStore'
import { useSidebarDrawer } from '@/composables/useSidebarDrawer'

const siteStore = useSiteStore()
const { isLg } = useSidebarDrawer()
const { t, tm } = useI18n()

/**
 * 月份缩写映射（响应式，跟随语言切换）
 */
const MONTH_NAMES = computed(() => tm('time.months') as string[])

/**
 * 归档数据（按年份分组）
 */
const archives = ref<PostArchiveResponse[]>([])
/**
 * 标签列表
 */
const tags = ref<TagPostCountResponse[]>([])
/**
 * 当前高亮的年份（侧边栏导航联动）
 */
const activeYear = ref<number | null>(null)
/**
 * 搜索关键词
 */
const searchKeyword = ref('')
/**
 * 选中的标签 ID
 */
const selectedTagId = ref<number | null>(null)
/**
 * 是否正在加载
 */
const loading = ref(true)

/**
 * 文章总数（各年份 total 之和）
 */
const totalPosts = computed(() => {
  return archives.value.reduce((sum, year) => sum + year.total, 0)
})

/**
 * 滚动到指定年份区块。
 * 设置活跃年份并平滑滚动到对应 DOM 元素位置。
 *
 * @param year 目标年份。
 */
const scrollToYear = (year: number) => {
  activeYear.value = year
  const el = document.getElementById(`year-${year}`)
  if (el) {
    // 预留顶部导航栏的偏移量
    const offset = 100
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

/**
 * 滚动事件处理。
 * 检测当前视口内的年份区块，自动更新侧边栏的活跃年份高亮。
 */
const handleScroll = () => {
  const blocks = document.querySelectorAll('[id^="year-"]')
  for (const block of blocks) {
    const rect = block.getBoundingClientRect()
    // 当区块顶部进入视口上方 200px 内且底部仍在视口中时，视为当前活跃年份
    if (rect.top < 200 && rect.bottom > 100) {
      const year = parseInt(block.id.replace('year-', ''))
      if (activeYear.value !== year) {
        activeYear.value = year
      }
      break
    }
  }
}

/**
 * 格式化日期为两位数日期。
 *
 * @param dateStr ISO 格式日期字符串。
 * @returns 两位数的日（如 "01", "15"）。
 */
const formatDay = (dateStr: string) => {
  return new Date(dateStr).getDate().toString().padStart(2, '0')
}

/**
 * 获取归档数据。
 * 根据当前搜索和标签筛选条件请求后端归档接口。
 */
const fetchArchives = async () => {
  loading.value = true
  const res = await getArchivePostsApi({
    keyword: searchKeyword.value || undefined,
    tagId: selectedTagId.value ?? undefined,
  })
  archives.value = res
  // 默认高亮第一个年份
  if (res.length > 0) activeYear.value = res[0]?.year ?? null
  loading.value = false
}

/**
 * 处理搜索事件。
 *
 * @param keyword 搜索关键词。
 */
const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
  fetchArchives()
}

/**
 * 处理标签选择事件。
 *
 * @param tagId 选中的标签 ID，null 表示取消筛选。
 */
const handleTagSelect = (tagId: number | null) => {
  selectedTagId.value = tagId
  fetchArchives()
}


onMounted(async () => {
  // 并行加载归档数据、标签列表和站点信息
  await Promise.all([
    fetchArchives(),
    getTagsApi().then(res => tags.value = res),
    siteStore.fetchSiteInfo(),
  ])

  // 注册滚动监听，用于年份导航联动
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- 主内容区（>= lg 占 8 栏） -->
      <main class="lg:col-span-8 flex flex-col gap-8">
        <PageTitleCard
            :title="t('archive.title')"
            :subtitle="t('archive.subtitle')"
            :count="totalPosts"
            :count-label="t('archive.countLabel')"
        />

        <!-- 加载状态 -->
        <ArchiveSkeleton v-if="loading" />

        <!-- 年份分组列表 -->
        <template v-else-if="archives.length > 0">
          <div
              v-for="yearGroup in archives"
              :key="yearGroup.year"
              :id="`year-${yearGroup.year}`"
              class="bento-card scroll-mt-32"
          >
            <!-- 年份标题栏（padding 响应式 px-4 → sm:px-6 → md:px-8） -->
            <div class="px-4 sm:px-6 md:px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-slate-50/30">
              <h2 class="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{{ yearGroup.year }}</h2>
              <span class="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                {{ yearGroup.total }} {{ t('archive.posts') }}
              </span>
            </div>

            <!-- 时间线主体（padding 响应式 p-4 → sm:p-6 → md:p-8） -->
            <div class="p-4 sm:p-6 md:p-8 relative">
              <!-- 竖线（left 响应式 left-4 → sm:left-6 → md:left-8） -->
              <div class="absolute left-4 sm:left-6 md:left-8 top-6 bottom-2 w-px bg-slate-100"></div>

              <div class="flex flex-col gap-8">
                <div v-for="monthGroup in yearGroup.months" :key="monthGroup.month" class="relative pl-10 sm:pl-12 md:pl-16">
                  <!-- 月份节点（缩进 pl-10 → sm:pl-12 → md:pl-16） -->
                  <div class="absolute left-4 sm:left-6 md:left-8 top-[-0.2rem] -translate-x-1/2">
                    <span class="inline-flex items-center justify-center font-mono text-[0.65rem] font-semibold text-slate-400 bg-white border border-slate-100 rounded-full px-2.5 py-0.5 shadow-sm">
                      {{ MONTH_NAMES[monthGroup.month - 1] }}
                    </span>
                  </div>

                  <!-- 文章列表（< sm 纵向排列 / >= sm 日期+标题横排） -->
                  <div class="flex flex-col gap-1 pt-1">
                    <router-link
                        v-for="post in monthGroup.posts"
                        :key="post.id"
                        :to="`/post/${post.slug}`"
                        class="px-3 py-2.5 -ml-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 cursor-pointer group rounded-lg border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-all"
                    >
                      <span class="text-sm font-mono font-bold text-slate-300 group-hover:text-slate-500 transition-colors sm:w-8 shrink-0">
                        {{ formatDay(post.createTime) }}
                      </span>
                      <h3 class="flex-1 text-sm font-bold text-slate-700 group-hover:text-slate-900 group-hover:underline decoration-slate-300 decoration-2 underline-offset-4 transition-colors">
                        {{ post.title }}
                      </h3>
                      <div class="flex flex-wrap gap-2 shrink-0">
                        <span
                            v-for="tag in post.tags ?? []"
                            :key="tag.id"
                            class="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide bg-slate-50 border border-slate-100 text-slate-400 group-hover:text-slate-500 group-hover:border-slate-300 transition-colors"
                        >
                          {{ tag.name }}
                        </span>
                      </div>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部结束标记 -->
          <div class="text-center text-xs text-slate-300 font-mono pb-8 flex items-center justify-center gap-2">
            <span class="size-1 rounded-full bg-slate-300"></span>
            <span>{{ t('archive.theBeginning') }}</span>
            <span class="size-1 rounded-full bg-slate-300"></span>
          </div>
        </template>

        <!-- 空状态 -->
        <div v-else class="text-center py-16 text-sm text-slate-400">
          {{ searchKeyword || selectedTagId ? t('archive.noMatchingPosts') : t('archive.noPosts') }}
        </div>
      </main>

      <!-- 侧边栏（< lg Teleport 至抽屉 / >= lg sticky 右侧） -->
      <aside class="lg:col-span-4 relative">
        <Teleport to="#sidebar-drawer-content" :disabled="isLg">
          <div class="sticky top-24 space-y-5">
            <ProfileCard v-if="siteStore.siteInfo" :owner="siteStore.siteInfo.owner" :stats="siteStore.siteInfo.stats" />
            <SetupHint v-else-if="siteStore.initialized === false" />
            <ProfileCardSkeleton v-else />

            <SearchBox :placeholder="t('archive.searchPlaceholder')" @search="handleSearch" />

            <TimelineNav v-if="!loading" :archives="archives" :active-year="activeYear" @scroll-to-year="scrollToYear" />
            <TimelineNavSkeleton v-else />

            <TagList
                :tags="tags"
                :active-tag-id="selectedTagId"
                :loading="loading"
                @select="handleTagSelect"
            />

            <SiteFooter />
          </div>
        </Teleport>
      </aside>
    </div>
  </div>
</template>
<!-- src/views/Archive.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import ProfileCard from '@/components/sidebar/ProfileCard.vue'
import SetupHint from '@/components/sidebar/SetupHint.vue'
import SearchBox from '@/components/sidebar/SearchBox.vue'
import TagList from '@/components/sidebar/TagList.vue'
import TimelineNav from '@/components/sidebar/TimelineNav.vue'
import SiteFooter from '@/components/sidebar/SiteFooter.vue'
import PageTitleCard from '@/components/common/PageTitleCard.vue'

import { getArchivePostsApi, type PostArchiveResponse } from '@/api/post'
import { getTagsApi, type TagPostCountResponse } from '@/api/tag'
import { useSiteStore } from '@/stores/useSiteStore'

const siteStore = useSiteStore()

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const archives = ref<PostArchiveResponse[]>([])
const tags = ref<TagPostCountResponse[]>([])
const activeYear = ref<number | null>(null)
const searchKeyword = ref('')
const selectedTagId = ref<number | null>(null)
const loading = ref(true)

const totalPosts = computed(() => {
  return archives.value.reduce((sum, year) => sum + year.total, 0)
})

const scrollToYear = (year: number) => {
  activeYear.value = year
  const el = document.getElementById(`year-${year}`)
  if (el) {
    const offset = 100
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

const handleScroll = () => {
  const blocks = document.querySelectorAll('[id^="year-"]')
  for (const block of blocks) {
    const rect = block.getBoundingClientRect()
    if (rect.top < 200 && rect.bottom > 100) {
      const year = parseInt(block.id.replace('year-', ''))
      if (activeYear.value !== year) {
        activeYear.value = year
      }
      break
    }
  }
}

const formatDay = (dateStr: string) => {
  return new Date(dateStr).getDate().toString().padStart(2, '0')
}

const fetchArchives = async () => {
  loading.value = true
  const res = await getArchivePostsApi({
    pageNum: 1,
    pageSize: 1000,
    keyword: searchKeyword.value || undefined,
    tagId: selectedTagId.value ?? undefined,
  })
  archives.value = res
  if (res.length > 0) activeYear.value = res[0]?.year ?? null
  loading.value = false
}

const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
  fetchArchives()
}

const handleTagSelect = (tagId: number | null) => {
  selectedTagId.value = tagId
  fetchArchives()
}

onMounted(async () => {
  await Promise.all([
    fetchArchives(),
    getTagsApi().then(res => tags.value = res),
    siteStore.fetchSiteInfo(),
  ])

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
      <!-- Main -->
      <main class="lg:col-span-8 flex flex-col gap-8">
        <PageTitleCard
            title="Archive"
            subtitle="Thinking about code, design, and life."
            :count="totalPosts"
            count-label="Total Posts"
        />

        <!-- Year Blocks -->
        <template v-if="archives.length > 0">
          <div
              v-for="yearGroup in archives"
              :key="yearGroup.year"
              :id="`year-${yearGroup.year}`"
              class="bento-card scroll-mt-32"
          >
            <!-- Year Header -->
            <div class="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-slate-50/30">
              <h2 class="text-3xl font-bold text-slate-800 tracking-tight">{{ yearGroup.year }}</h2>
              <span class="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                {{ yearGroup.total }} Posts
              </span>
            </div>

            <!-- Timeline Body -->
            <div class="p-8 relative">
              <div class="absolute left-8 top-6 bottom-2 w-px bg-slate-100"></div>

              <div class="flex flex-col gap-8">
                <div v-for="monthGroup in yearGroup.months" :key="monthGroup.month" class="relative pl-16">
                  <!-- Month Node -->
                  <div class="absolute left-8 top-[-0.2rem] -translate-x-1/2">
                    <span class="inline-flex items-center justify-center font-mono text-[0.65rem] font-semibold text-slate-400 bg-white border border-slate-100 rounded-full px-2.5 py-0.5 shadow-sm">
                      {{ MONTH_NAMES[monthGroup.month - 1] }}
                    </span>
                  </div>

                  <!-- Posts -->
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
                            v-for="tag in post.tags"
                            :key="tag.id"
                            class="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-slate-50 border border-slate-100 text-slate-300 group-hover:text-slate-500 group-hover:border-slate-300 transition-colors"
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

          <!-- End Note -->
          <div class="text-center text-xs text-slate-300 font-mono pb-8 flex items-center justify-center gap-2">
            <span class="size-1 rounded-full bg-slate-300"></span>
            <span>THE BEGINNING</span>
            <span class="size-1 rounded-full bg-slate-300"></span>
          </div>
        </template>

        <!-- Empty State -->
        <div v-else-if="!loading" class="text-center py-16 text-sm text-slate-400">
          {{ searchKeyword || selectedTagId ? 'No matching posts.' : 'No posts yet.' }}
        </div>
      </main>

      <!-- Sidebar -->
      <aside class="lg:col-span-4 relative hidden lg:block">
        <div class="sticky top-24 space-y-5">
          <ProfileCard v-if="siteStore.siteInfo" :owner="siteStore.siteInfo.owner" :stats="siteStore.siteInfo.stats" />
          <SetupHint v-else-if="siteStore.initialized === false" />

          <SearchBox placeholder="Filter archives..." @search="handleSearch" />

          <TimelineNav :archives="archives" :active-year="activeYear" @scroll-to-year="scrollToYear" />

          <TagList
              :tags="tags"
              :active-tag-id="selectedTagId"
              @select="handleTagSelect"
          />

          <SiteFooter />
        </div>
      </aside>
    </div>
  </div>
</template>
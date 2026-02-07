<!-- src/views/Memos.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Pin } from 'lucide-vue-next'
import { useInfiniteScroll } from '@vueuse/core'
import AppHeader from '@/components/layout/AppHeader.vue'
import ProfileCard from '@/components/sidebar/ProfileCard.vue'
import SearchBox from '@/components/sidebar/SearchBox.vue'
import PageTitleCard from '@/components/common/PageTitleCard.vue'
import { useMarkdown } from '@/composables/useMarkdown'

import { getMemosApi, type MemoResponse } from '@/api/memo'
import { getSiteInfoApi, type SiteInfoResponse } from '@/api/site'

const { render } = useMarkdown()

const memos = ref<MemoResponse[]>([])
const siteInfo = ref<SiteInfoResponse | null>(null)
const total = ref(0)
const searchKeyword = ref('')
const pageNum = ref(1)
const pageSize = 10
const loading = ref(false)
const noMore = ref(false)

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 1 ? 'Just now' : `${minutes}m ago`
    }
    return `${hours}h ago`
  }
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const fetchMemos = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const res = await getMemosApi({
      pageNum: pageNum.value,
      pageSize,
      keyword: searchKeyword.value || undefined,
    })
    memos.value.push(...res.records)
    total.value = res.total
    if (pageNum.value * pageSize >= res.total) {
      noMore.value = true
    }
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loading.value || noMore.value) return
  pageNum.value++
  await fetchMemos()
}

const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
  pageNum.value = 1
  noMore.value = false
  memos.value = []
  fetchMemos()
}

useInfiniteScroll(document, loadMore, { distance: 200 })

onMounted(async () => {
  await Promise.all([
    fetchMemos(),
    getSiteInfoApi().then(res => siteInfo.value = res),
  ])
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main -->
      <main class="lg:col-span-8 flex flex-col gap-6">
        <PageTitleCard
            title="Memos"
            subtitle="Fragments of thoughts, unfiltered."
            :count="total"
            count-label="Total Memos"
        />

        <!-- Memo List -->
        <div class="flex flex-col gap-4">
          <article
              v-for="memo in memos"
              :key="memo.id"
              class="bento-card p-5"
          >
            <!-- Header: Avatar + Name + Time -->
            <div class="flex items-center gap-3 mb-3">
              <img
                  :src="siteInfo?.owner.avatar"
                  class="size-8 rounded-full ring-1 ring-slate-100"
                  alt="avatar"
              />
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="text-sm font-medium text-slate-800 truncate">
                  {{ siteInfo?.owner.nickname || 'Admin' }}
                </span>
                <span class="text-slate-300">·</span>
                <span class="text-xs text-slate-400">{{ formatTime(memo.createTime) }}</span>
              </div>
              <Pin
                  v-if="memo.isPinned"
                  :size="14"
                  class="text-slate-300 shrink-0"
              />
            </div>

            <!-- Content -->
            <div class="memo-content markdown-body pl-11" v-html="render(memo.content)"></div>
          </article>
        </div>

        <!-- Loading / End -->
        <div class="text-center py-8">
          <span v-if="loading" class="text-xs font-mono text-slate-400 tracking-wide">Loading...</span>
          <span v-else-if="noMore" class="text-xs font-mono text-slate-300 tracking-wide">— End of Stream —</span>
        </div>
      </main>

      <!-- Sidebar -->
      <aside class="lg:col-span-4 relative hidden lg:block">
        <div class="sticky top-24 space-y-5">
          <ProfileCard v-if="siteInfo" :owner="siteInfo.owner" :stats="siteInfo.stats" />
          <SearchBox placeholder="Search memos..." @search="handleSearch" />
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* Memo 内容样式覆盖，使其更紧凑 */
.memo-content :deep(p) {
  margin: 0.5em 0;
  font-size: 15px;
  line-height: 1.6;
  color: #475569;
}

.memo-content :deep(p:first-child) {
  margin-top: 0;
}

.memo-content :deep(p:last-child) {
  margin-bottom: 0;
}

.memo-content :deep(ul),
.memo-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.memo-content :deep(li) {
  margin: 0.25em 0;
  font-size: 15px;
}

.memo-content :deep(code):not(pre code) {
  font-size: 13px;
  padding: 0.15em 0.4em;
}

.memo-content :deep(.code-block) {
  margin: 0.75em 0;
}

.memo-content :deep(blockquote) {
  margin: 0.5em 0;
  padding: 0.5em 1em;
  font-size: 14px;
}

.memo-content :deep(a) {
  color: #64748b;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.memo-content :deep(a:hover) {
  color: #334155;
}
</style>
<!-- src/views/Memos.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Pin } from 'lucide-vue-next'
import AppHeader from '@/components/layout/AppHeader.vue'
import ProfileCard from '@/components/sidebar/ProfileCard.vue'
import SearchBox from '@/components/sidebar/SearchBox.vue'
import PageTitleCard from '@/components/common/PageTitleCard.vue'

import { getMemosApi, type MemoResponse } from '@/api/memo'
import { getSiteInfoApi, type SiteInfoResponse } from '@/api/site'

const memos = ref<MemoResponse[]>([])
const siteInfo = ref<SiteInfoResponse | null>(null)
const total = ref(0)
const searchKeyword = ref('')

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
  const res = await getMemosApi({
    pageNum: 1,
    pageSize: 50,
    keyword: searchKeyword.value || undefined,
  })
  memos.value = res.records
  total.value = res.total
}

const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
  fetchMemos()
}

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
            <div class="text-[15px] leading-relaxed text-slate-600 whitespace-pre-wrap pl-11">
              {{ memo.content }}
            </div>
          </article>
        </div>

        <!-- End -->
        <div class="text-center py-8">
          <span class="text-xs font-mono text-slate-300 tracking-wide">— End of Stream —</span>
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
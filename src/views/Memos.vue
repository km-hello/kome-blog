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
  return dateStr.replace('T', ' ').slice(0, 16)
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
        <div class="flex flex-col gap-6">
          <article
              v-for="memo in memos"
              :key="memo.id"
              class="bento-card p-6 flex gap-5"
          >
            <!-- Avatar -->
            <div class="shrink-0 pt-1">
              <div class="size-10 rounded-full bg-slate-100 p-0.5 border border-slate-100">
                <img
                    :src="siteInfo?.owner.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix'"
                    class="size-full rounded-full bg-white"
                >
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 flex flex-col">
              <div class="flex justify-between items-center mb-3">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold text-slate-900">{{ siteInfo?.owner.nickname || 'Admin' }}</span>
                  <span
                      v-if="memo.isPinned"
                      class="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1"
                  >
                    <Pin :size="9" /> TOP
                  </span>
                </div>
                <span class="text-xs text-slate-400 font-mono">{{ formatTime(memo.createTime) }}</span>
              </div>

              <div class="text-[15px] leading-7 text-slate-600 whitespace-pre-wrap">
                {{ memo.content }}
              </div>
            </div>
          </article>
        </div>

        <!-- End -->
        <div class="text-center py-8">
          <span class="text-xs font-mono text-slate-300">End of Stream</span>
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
<!-- src/views/Home.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import ProfileCard from '@/components/sidebar/ProfileCard.vue'
import SearchBox from '@/components/sidebar/SearchBox.vue'
import TopicList from '@/components/sidebar/TopicList.vue'
import MemoPreview from '@/components/sidebar/MemoPreview.vue'
import PostCard from '@/components/home/PostCard.vue'
import Pagination from '@/components/ui/Pagination.vue'

import { getPostsApi, type PostSimpleResponse } from '@/api/post'
import { getTagsApi, type TagPostCountResponse } from '@/api/tag'
import { getLatestMemosApi, type MemoResponse } from '@/api/memo'
import { getSiteInfoApi, type SiteInfoResponse } from '@/api/site'

const posts = ref<PostSimpleResponse[]>([])
const tags = ref<TagPostCountResponse[]>([])
const memos = ref<MemoResponse[]>([])
const siteInfo = ref<SiteInfoResponse | null>(null)

const currentPage = ref(1)
const pageSize = 8
const total = ref(0)
const searchKeyword = ref('')

const loading = ref(false)

const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await getPostsApi({
      pageNum: currentPage.value,
      pageSize,
      keyword: searchKeyword.value || undefined,
    })
    posts.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
  currentPage.value = 1
  fetchPosts()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchPosts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  await Promise.all([
    fetchPosts(),
    getTagsApi().then(res => tags.value = res),
    getLatestMemosApi(2).then(res => memos.value = res),
    getSiteInfoApi().then(res => siteInfo.value = res),
  ])
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Content -->
      <main class="lg:col-span-8 flex flex-col gap-6">
        <PostCard v-for="post in posts" :key="post.id" :post="post" />

        <Pagination
            :current="currentPage"
            :total="total"
            :page-size="pageSize"
            @change="handlePageChange"
        />
      </main>

      <!-- Sidebar -->
      <aside class="lg:col-span-4 relative">
        <div class="sticky top-24 space-y-5">
          <ProfileCard
              v-if="siteInfo"
              :owner="siteInfo.owner"
              :stats="siteInfo.stats"
          />

          <SearchBox placeholder="Search..." @search="handleSearch" />

          <MemoPreview :memos="memos" />

          <TopicList :tags="tags" />

          <SiteFooter />
        </div>
      </aside>
    </div>
  </div>
</template>
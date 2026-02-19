<!-- src/views/Home.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import SiteFooter from '@/components/sidebar/SiteFooter.vue'
import ProfileCard from '@/components/sidebar/ProfileCard.vue'
import SetupHint from '@/components/sidebar/SetupHint.vue'
import SearchBox from '@/components/sidebar/SearchBox.vue'
import TagList from '@/components/sidebar/TagList.vue'
import LatestMemo from '@/components/sidebar/LatestMemo.vue'
import PostCard from '@/components/post/PostCard.vue'
import PostCardSkeleton from '@/components/skeleton/PostCardSkeleton.vue'
import Pagination from '@/components/common/Pagination.vue'

import { getPostsApi, type PostSimpleResponse } from '@/api/post'
import { getTagsApi, type TagPostCountResponse } from '@/api/tag'
import { getLatestMemosApi, type MemoResponse } from '@/api/memo'
import { useSiteStore } from '@/stores/useSiteStore'

const siteStore = useSiteStore()

const posts = ref<PostSimpleResponse[]>([])
const tags = ref<TagPostCountResponse[]>([])
const memos = ref<MemoResponse[]>([])

const currentPage = ref(1)
const pageSize = 8
const total = ref(0)
const searchKeyword = ref('')
const selectedTagId = ref<number | null>(null)

const loading = ref(true)

const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await getPostsApi({
      pageNum: currentPage.value,
      pageSize,
      keyword: searchKeyword.value || undefined,
      tagId: selectedTagId.value ?? undefined,
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

const handleTagSelect = (tagId: number | null) => {
  selectedTagId.value = tagId
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
    siteStore.fetchSiteInfo(),
  ])
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Content -->
      <main class="lg:col-span-8 flex flex-col gap-6">
        <!-- Loading State -->
        <template v-if="loading">
          <PostCardSkeleton v-for="i in 3" :key="i" />
        </template>

        <!-- Posts List -->
        <template v-else-if="posts.length > 0">
          <PostCard v-for="post in posts" :key="post.id" :post="post" />

          <Pagination
              :current="currentPage"
              :total="total"
              :page-size="pageSize"
              @change="handlePageChange"
          />
        </template>

        <!-- Empty State -->
        <div v-else class="text-center py-16 text-sm text-slate-400">
          {{ searchKeyword || selectedTagId ? 'No matching posts.' : 'No posts yet.' }}
        </div>
      </main>

      <!-- Sidebar -->
      <aside class="lg:col-span-4 relative">
        <div class="sticky top-24 space-y-5">
          <ProfileCard
              v-if="siteStore.siteInfo"
              :owner="siteStore.siteInfo.owner"
              :stats="siteStore.siteInfo.stats"
          />
          <SetupHint v-else-if="siteStore.initialized === false" />

          <SearchBox placeholder="Search..." @search="handleSearch" />

          <LatestMemo :memos="memos" :loading="loading" />

          <TagList
              :tags="tags"
              :active-tag-id="selectedTagId"
              :loading="loading"
              @select="handleTagSelect"
          />

          <SiteFooter />
        </div>
      </aside>
    </div>
  </div>
</template>
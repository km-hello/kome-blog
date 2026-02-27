<!--
  Home.vue - 博客首页

  功能：展示文章分页列表，支持关键词搜索和标签筛选。

  布局：
    - 主内容区（lg:col-span-8）：文章卡片列表 + 分页
    - 侧边栏（lg:col-span-4）：个人资料、搜索框、最新动态、标签云、页脚

  响应式：
    - < lg (1024px): 侧边栏通过 Teleport 移入抽屉组件
    - >= lg: 侧边栏固定在右侧，sticky 定位
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import SiteFooter from '@/components/sidebar/SiteFooter.vue'
import ProfileCard from '@/components/sidebar/ProfileCard.vue'
import ProfileCardSkeleton from '@/components/skeleton/ProfileCardSkeleton.vue'
import SetupHint from '@/components/sidebar/SetupHint.vue'
import SearchBox from '@/components/sidebar/SearchBox.vue'
import TagList from '@/components/sidebar/TagList.vue'
import LatestMemo from '@/components/sidebar/LatestMemo.vue'
import PostCard from '@/components/post/PostCard.vue'
import PostCardSkeleton from '@/components/skeleton/PostCardSkeleton.vue'
import Pagination from '@/components/common/Pagination.vue'
import { useSidebarDrawer } from '@/composables/useSidebarDrawer'

import { getPostsApi, type PostSimpleResponse } from '@/api/post'
import { getTagsApi, type TagPostCountResponse } from '@/api/tag'
import { getLatestMemosApi, type MemoResponse } from '@/api/memo'
import { useSiteStore } from '@/stores/useSiteStore'

// ========== 状态定义 ==========

const siteStore = useSiteStore()
const { isLg } = useSidebarDrawer()

/** 文章列表 */
const posts = ref<PostSimpleResponse[]>([])
/** 标签列表（含文章数量） */
const tags = ref<TagPostCountResponse[]>([])
/** 最新动态列表 */
const memos = ref<MemoResponse[]>([])

/** 当前页码 */
const currentPage = ref(1)
/** 每页条数 */
const pageSize = 8
/** 文章总数 */
const total = ref(0)
/** 搜索关键词 */
const searchKeyword = ref('')
/** 选中的标签 ID */
const selectedTagId = ref<number | null>(null)

/** 是否正在加载 */
const loading = ref(true)

// ========== 方法 ==========

/**
 * 获取文章列表。
 * 根据当前分页和筛选条件请求后端数据。
 */
const fetchPosts = async () => {
  loading.value = true
  try {
    // 构建查询参数，空值传 undefined 避免发送无效参数
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

/**
 * 处理搜索事件。
 * 重置页码并重新加载文章列表。
 *
 * @param keyword 搜索关键词。
 */
const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
  currentPage.value = 1
  fetchPosts()
}

/**
 * 处理标签选择事件。
 * 重置页码并按所选标签筛选文章。
 *
 * @param tagId 选中的标签 ID，null 表示取消筛选。
 */
const handleTagSelect = (tagId: number | null) => {
  selectedTagId.value = tagId
  currentPage.value = 1
  fetchPosts()
}

/**
 * 处理分页切换事件。
 * 更新页码、重新加载数据并平滑滚动到页面顶部。
 *
 * @param page 目标页码。
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchPosts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ========== 生命周期 ==========

/** 页面挂载时并行加载文章、标签、最新动态和站点信息 */
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
      <!-- 主内容区 -->
      <main class="lg:col-span-8 flex flex-col gap-6">
        <!-- 加载状态：骨架屏占位 -->
        <template v-if="loading">
          <PostCardSkeleton v-for="i in 3" :key="i" />
        </template>

        <!-- 文章列表 -->
        <template v-else-if="posts.length > 0">
          <PostCard v-for="post in posts" :key="post.id" :post="post" />

          <Pagination
              :current="currentPage"
              :total="total"
              :page-size="pageSize"
              @change="handlePageChange"
          />
        </template>

        <!-- 空状态 -->
        <div v-else class="text-center py-16 text-sm text-slate-400">
          {{ searchKeyword || selectedTagId ? 'No matching posts.' : 'No posts yet.' }}
        </div>
      </main>

      <!-- 侧边栏: < lg 通过 Teleport 移入抽屉; >= lg 固定右侧 sticky -->
      <aside class="lg:col-span-4 relative">
        <Teleport to="#sidebar-drawer-content" :disabled="isLg">
          <div class="sticky top-24 space-y-5">
            <ProfileCard
                v-if="siteStore.siteInfo"
                :owner="siteStore.siteInfo.owner"
                :stats="siteStore.siteInfo.stats"
            />
            <SetupHint v-else-if="siteStore.initialized === false" />
            <ProfileCardSkeleton v-else />

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
        </Teleport>
      </aside>
    </div>
  </div>
</template>
<!-- Home.vue - 博客首页 -->
<script setup lang="ts">
import {ref, watch, onMounted, onActivated} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useI18n} from 'vue-i18n'
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
import SidebarSkeleton from '@/components/skeleton/SidebarSkeleton.vue'
import Pagination from '@/components/common/Pagination.vue'
import {useSidebarDrawer} from '@/composables/useSidebarDrawer'

import {getPostsApi, type PostSimpleResponse} from '@/api/post'
import {getTagsApi, type TagPostCountResponse} from '@/api/tag'
import {getLatestMemosApi, type MemoResponse} from '@/api/memo'
import {useSiteStore} from '@/stores/useSiteStore'

const siteStore = useSiteStore()
const {isLg} = useSidebarDrawer()
const {t} = useI18n()
const route = useRoute()
const router = useRouter()

/**
 * 文章列表
 */
const posts = ref<PostSimpleResponse[]>([])
/**
 * 标签列表（含文章数量）
 */
const tags = ref<TagPostCountResponse[]>([])
/**
 * 最新动态列表
 */
const memos = ref<MemoResponse[]>([])
/**
 * 当前页码（从 URL query ?page= 初始化）。
 * 页面刷新或直接访问 /?page=3 时可恢复到正确页码。
 */
const currentPage = ref(Number(route.query.page) || 1)
/**
 * 每页条数
 */
const pageSize = 8
/**
 * 文章总数
 */
const total = ref(0)
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
  // 清除 URL 中的 page 参数（用 replace 不产生新历史记录），
  // 防止用户刷新时仍停留在旧页码
  if (route.query.page) router.replace({ query: {} })
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
  // 同 handleSearch，清除 URL page 参数
  if (route.query.page) router.replace({ query: {} })
}

/**
 * 处理分页切换事件。
 * 仅更新 URL（push 新增历史条目，支持浏览器逐页回退），由 watcher 统一驱动数据刷新。
 * 第 1 页不写入 page 参数，保持 URL 干净。
 */
const handlePageChange = (page: number) => {
  router.push({ query: { ...route.query, page: page > 1 ? String(page) : undefined } })
}

/**
 * 监听 URL ?page 变化，统一驱动分页数据刷新。
 * 触发场景：handlePageChange 的 push / 浏览器返回前进。
 */
watch(() => route.query.page, (newPage) => {
  if (route.name !== 'Home') return          // KeepAlive 下离开 Home 时忽略
  const page = Number(newPage) || 1
  if (page === currentPage.value) return     // 页码未变，避免双重请求
  currentPage.value = page
  fetchPosts()
  window.scrollTo({top: 0, behavior: 'smooth'})
})

/**
 * 页面挂载时并行加载文章、标签、最新动态和站点信息
 */
onMounted(async () => {
  await Promise.all([
    fetchPosts(),
    getTagsApi().then(res => tags.value = res),
    getLatestMemosApi(2).then(res => memos.value = res),
    siteStore.fetchSiteInfo(),
  ])
})

/**
 * KeepAlive 激活回调 — 弥补 watcher 的盲区。
 * 从 About 等页面通过导航链接回到 Home 时，route.query.page 不变（undefined→undefined），
 * watcher 不触发，需要在此处对比 URL 页码和缓存页码来决定刷新策略。
 */
let firstActivation = true
onActivated(() => {
  if (firstActivation) { firstActivation = false; return } // 首次由 onMounted 处理

  const urlPage = Number(route.query.page) || 1

  if (urlPage !== currentPage.value) {
    // 导航链接回 Home（URL 为 /）→ 重置页码，完整刷新
    currentPage.value = urlPage
    fetchPosts()
    window.scrollTo({top: 0, behavior: 'smooth'})
  } else {
    // 浏览器返回到同一页 → 静默刷新（不触发 loading，保持滚动位置）
    getPostsApi({
      pageNum: currentPage.value,
      pageSize,
      keyword: searchKeyword.value || undefined,
      tagId: selectedTagId.value ?? undefined,
    }).then(res => {
      posts.value = res.records
      total.value = res.total
    }).catch(() => {})
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader/>

    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- 主内容区（>= lg 占 8 栏） -->
      <main class="lg:col-span-8 flex flex-col gap-6">
        <!-- 加载骨架屏 -->
        <template v-if="loading">
          <PostCardSkeleton v-for="i in 3" :key="i"/>
        </template>

        <!-- 文章列表 -->
        <template v-else-if="posts.length > 0">
          <PostCard v-for="post in posts" :key="post.id" :post="post"/>

          <Pagination
              :current="currentPage"
              :total="total"
              :page-size="pageSize"
              @change="handlePageChange"
          />
        </template>

        <!-- 空状态 -->
        <div v-else class="text-center py-16 text-sm text-slate-400">
          {{ searchKeyword || selectedTagId ? t('home.noMatchingPosts') : t('home.noPosts') }}
        </div>
      </main>

      <!-- 侧边栏（< lg Teleport 至抽屉 / >= lg sticky 右侧） -->
      <aside class="lg:col-span-4 relative">
        <Teleport to="#sidebar-drawer-content" :disabled="isLg">
          <div class="sticky top-24 space-y-5">
            <ProfileCard
                v-if="siteStore.siteInfo"
                :owner="siteStore.siteInfo.owner"
                :stats="siteStore.siteInfo.stats"
            />
            <SetupHint v-else-if="siteStore.initialized === false"/>
            <ProfileCardSkeleton v-else/>

            <SearchBox :placeholder="t('home.searchPlaceholder')" @search="handleSearch"/>

            <LatestMemo v-if="!loading" :memos="memos"/>
            <SidebarSkeleton v-else variant="memos"/>

            <TagList
                v-if="!loading"
                :tags="tags"
                :active-tag-id="selectedTagId"
                @select="handleTagSelect"
            />
            <SidebarSkeleton v-else variant="tags"/>

            <SiteFooter/>
          </div>
        </Teleport>
      </aside>
    </div>
  </div>
</template>
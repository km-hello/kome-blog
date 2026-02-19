<!--
  src/views/Memos.vue
  碎碎念 / 微博客页面 —— 路由: /memos

  功能概览:
    - 分页加载 Memo 列表，配合 useInfiniteScroll 实现无限滚动
    - 关键词搜索（重置分页后重新加载）
    - Markdown 渲染（compact 密度），支持代码块一键复制
    - Mermaid 图表点击放大（由 MermaidModal 组件提供）
    - 右侧栏：个人资料卡片、搜索框、Memo 统计
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Pin, Loader2 } from 'lucide-vue-next'
import { useInfiniteScroll } from '@vueuse/core'
import AppHeader from '@/components/common/AppHeader.vue'
import MemoSkeleton from '@/components/skeleton/MemoSkeleton.vue'
import ProfileCard from '@/components/sidebar/ProfileCard.vue'
import SetupHint from '@/components/sidebar/SetupHint.vue'
import SearchBox from '@/components/sidebar/SearchBox.vue'
import MemoStats from '@/components/sidebar/MemoStats.vue'
import SiteFooter from '@/components/sidebar/SiteFooter.vue'
import PageTitleCard from '@/components/common/PageTitleCard.vue'
import MermaidModal from '@/components/common/MermaidModal.vue'
import { useMarkdown } from '@/composables/useMarkdown'
import { useCodeCopy } from '@/composables/useCodeCopy'

import { getMemosApi, getMemoStatsApi, type MemoResponse, type MemoStatsResponse } from '@/api/memo'
import { useSiteStore } from '@/stores/useSiteStore'

const siteStore = useSiteStore()
const { render, renderMermaidCharts } = useMarkdown()

// 注册代码块复制功能（事件委托，自动管理生命周期）
useCodeCopy()

/* ==================== 响应式状态 ==================== */

/** 已加载的 Memo 列表（追加模式，支持无限滚动） */
const memos = ref<MemoResponse[]>([])
/** Memo 统计数据，独立接口获取 */
const memoStats = ref<MemoStatsResponse | null>(null)
/** Memo 总数，用于页面标题卡片展示 */
const total = ref(0)
/** 当前搜索关键词，为空时加载全部 */
const searchKeyword = ref('')
/** 当前页码（从 1 开始） */
const pageNum = ref(1)
/** 每页条数 */
const pageSize = 10
/** 是否正在加载中（防止重复请求） */
const loading = ref(false)
/** 是否已加载完全部数据（无更多内容） */
const noMore = ref(false)

/* ==================== 工具函数 ==================== */

/**
 * 将日期字符串格式化为人性化的相对时间
 * - 1 分钟内 → "Just now"
 * - 同天内 → "Xm ago" / "Xh ago"
 * - 昨天 → "Yesterday"
 * - 7 天内 → "Xd ago"
 * - 更早 → "Mon DD" 格式（如 "Jan 15"）
 */
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

/* ==================== 数据获取 ==================== */

/**
 * 获取当前页的 Memo 数据
 * 结果以追加方式合并到 memos 列表，当已加载条数 >= 总数时标记为 noMore
 */
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
    // 脱离 Vue 更新队列，等 DOM 稳定后渲染 Mermaid 图表
    setTimeout(() => renderMermaidCharts(), 0)
  }
}

/**
 * 加载下一页（由 useInfiniteScroll 自动触发）
 * 当正在加载或已无更多数据时跳过
 */
const loadMore = async () => {
  if (loading.value || noMore.value) return
  pageNum.value++
  await fetchMemos()
}

/**
 * 搜索处理：重置分页状态并重新加载
 * 由 SearchBox 组件的 @search 事件触发
 */
const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
  pageNum.value = 1
  noMore.value = false
  memos.value = []
  fetchMemos()
}

/* ==================== 无限滚动 ==================== */

// 监听 document 滚动，当距底部 200px 时自动触发 loadMore
useInfiniteScroll(document, loadMore, { distance: 200 })

/* ==================== 生命周期 ==================== */

// 并行加载：Memo 列表 + 站点信息 + Memo 统计
onMounted(async () => {
  await Promise.all([
    fetchMemos(),
    siteStore.fetchSiteInfo(),
    getMemoStatsApi().then(res => memoStats.value = res),
  ])
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- ==================== 主内容区 ==================== -->
      <main class="lg:col-span-8 flex flex-col gap-6">

        <!-- 页面标题卡片 -->
        <PageTitleCard
            title="Memos"
            subtitle="Fragments of thoughts, unfiltered."
            :count="total"
            count-label="Total Memos"
        />

        <!-- ==================== Initial Loading State ==================== -->
        <template v-if="loading && memos.length === 0">
          <MemoSkeleton v-for="i in 3" :key="i" />
        </template>

        <!-- ==================== Memo 列表 ==================== -->
        <div v-else-if="memos.length > 0" class="flex flex-col gap-4">
          <article
              v-for="memo in memos"
              :key="memo.id"
              class="bento-card p-5"
          >
            <!-- 头部：头像 + 昵称 + 相对时间 + 置顶图标 -->
            <div class="flex items-center gap-3 mb-3">
              <img
                  :src="siteStore.siteInfo?.owner.avatar"
                  class="size-8 rounded-full ring-1 ring-slate-100"
                  alt="avatar"
              />
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="text-sm font-medium text-slate-800 truncate">
                  {{ siteStore.siteInfo?.owner.nickname || 'Admin' }}
                </span>
                <span class="text-slate-300">&middot;</span>
                <span class="text-xs text-slate-400">{{ formatTime(memo.createTime) }}</span>
              </div>
              <!-- 置顶标识 -->
              <Pin
                  v-if="memo.isPinned"
                  :size="14"
                  class="text-slate-300 shrink-0"
              />
            </div>

            <!-- Markdown 内容：使用 compact 密度样式 + 左侧缩进对齐头像 -->
            <div class="markdown-body markdown-compact pl-11" v-html="render(memo.content)"></div>
          </article>
        </div>

        <!-- ==================== 空状态 ==================== -->
        <div v-else-if="!loading && noMore" class="text-center py-16 text-sm text-slate-400">
          {{ searchKeyword ? 'No matching memos.' : 'No memos yet.' }}
        </div>

        <!-- ==================== 加载状态 / 底部提示 ==================== -->
        <div v-if="memos.length > 0 || loading" class="text-center py-8">
          <Loader2 v-if="loading" class="size-5 animate-spin text-slate-300 mx-auto" />
          <span v-else-if="noMore" class="text-xs font-mono text-slate-300 tracking-wide">&mdash; End of Stream &mdash;</span>
        </div>
      </main>

      <!-- ==================== 右侧栏 ==================== -->
      <aside class="lg:col-span-4 relative hidden lg:block">
        <div class="sticky top-24 space-y-5">
          <!-- 个人资料卡片 -->
          <ProfileCard v-if="siteStore.siteInfo" :owner="siteStore.siteInfo.owner" :stats="siteStore.siteInfo.stats" />
          <SetupHint v-else-if="siteStore.initialized === false" />
          <!-- 搜索框 -->
          <SearchBox placeholder="Search memos..." @search="handleSearch" />
          <!-- Memo 统计（热力图等） -->
          <MemoStats v-if="memoStats" :stats="memoStats" />

          <SiteFooter />
        </div>
      </aside>
    </div>

    <!-- Mermaid 图表放大模态框 -->
    <MermaidModal />
  </div>
</template>

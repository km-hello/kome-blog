<!--
  src/views/PostDetail.vue
  文章详情页 —— 路由: /post/:slug

  功能概览:
    - 根据 slug 获取文章数据并渲染 Markdown 正文
    - 右侧 TOC 目录：自动跟随滚动高亮、点击平滑跳转
    - 代码块一键复制（由 useCodeCopy composable 提供）
    - Mermaid 图表点击放大（由 MermaidModal 组件提供）
    - 文章过期提醒（距上次更新超过 180 天）
    - 上一篇 / 下一篇导航
-->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, PenLine, Clock, ArrowLeft, ArrowRight, Eye, AlertTriangle } from 'lucide-vue-next'
import AppHeader from '@/components/common/AppHeader.vue'
import MermaidModal from '@/components/common/MermaidModal.vue'
import { getPostDetailApi, type PostDetailResponse } from '@/api/post'
import { useMarkdown } from '@/composables/useMarkdown'
import { useCodeCopy } from '@/composables/useCodeCopy'

const route = useRoute()
const router = useRouter()
const { render, toc, renderMermaidCharts } = useMarkdown({ collectToc: true })

// 注册代码块复制功能（事件委托，自动管理生命周期）
useCodeCopy()

/* ==================== 响应式状态 ==================== */

const post = ref<PostDetailResponse | null>(null)
const loading = ref(true)
/** 当前滚动高亮的 TOC 锚点 id */
const activeSection = ref('')
/** TOC 容器 DOM 引用，用于自动滚动 TOC 列表到当前活跃项 */
const tocContainer = ref<HTMLElement | null>(null)

/* ==================== 工具函数 ==================== */

/** 格式化日期为 YYYY-MM-DD 格式（中文 locale） */
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-')
}

/* ==================== 计算属性 ==================== */

/**
 * 是否显示"更新日期"
 * 只比较日期部分（YYYY-MM-DD），避免同一天内的微小时间差导致多余显示
 */
const showUpdateDate = computed(() => {
  if (!post.value?.updateTime || !post.value?.createTime) return false
  return post.value.updateTime.slice(0, 10) !== post.value.createTime.slice(0, 10)
})

/** 内容过期提醒：距上次更新（或创建）超过 180 天 */
const isOutdated = computed(() => {
  if (!post.value) return false
  const ref = post.value.updateTime || post.value.createTime
  if (!ref) return false
  const diffMs = Date.now() - new Date(ref).getTime()
  return diffMs > 180 * 24 * 60 * 60 * 1000
})

/** 渲染 Markdown 正文为 HTML（惰性计算，post 数据变化时自动更新） */
const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return render(post.value.content)
})

/* ==================== 副作用 / 监听器 ==================== */

/**
 * 监听渲染后的 HTML 变化，等待 DOM 更新后初始化 Mermaid 图表
 * Mermaid 需要在 DOM 中找到占位元素才能渲染，所以必须等 nextTick
 */
watch(renderedContent, async (newVal) => {
  if (!newVal) return
  await nextTick()
  await renderMermaidCharts()
})

/**
 * 平滑滚动到指定锚点
 * @param id - 目标标题的 DOM id
 */
const scrollTo = (id: string) => {
  activeSection.value = id
  const element = document.getElementById(id)
  if (element) {
    // 预留顶部固定导航栏的高度偏移
    const headerOffset = 100
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
  }
}

/**
 * 滚动事件处理：根据当前可视区域更新 TOC 高亮项
 * 遍历所有 h2/h3 标题，找到最后一个已滚过视口顶部 120px 的标题作为当前高亮项；
 * 页面顶部（scrollY < 100）时默认高亮第一个标题
 */
const handleScroll = () => {
  const headers = document.querySelectorAll('.markdown-body h2, .markdown-body h3')
  if (headers.length === 0) return

  const offsetTop = 120
  let currentId = ''

  for (const header of headers) {
    const rect = header.getBoundingClientRect()
    if (rect.top < offsetTop) {
      currentId = header.id
    } else {
      break
    }
  }

  if (currentId) {
    activeSection.value = currentId
  } else if (window.scrollY < 100 && headers.length > 0) {
    // 页面顶部时默认高亮第一个标题
    const firstHeader = headers[0] as HTMLElement
    if (firstHeader.id) {
      activeSection.value = firstHeader.id
    }
  }
}

/**
 * TOC 列表自动滚动：当高亮项变化时，将 TOC 容器滚动使当前项居中可见
 */
watch(activeSection, async (newVal) => {
  if (!newVal || !tocContainer.value) return
  await nextTick()

  const activeLink = tocContainer.value.querySelector('.toc-link.active')
  if (activeLink) {
    const el = activeLink as HTMLElement
    // 计算使当前项垂直居中的滚动位置
    const top = el.offsetTop - tocContainer.value.offsetHeight / 2 + el.offsetHeight / 2
    tocContainer.value.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }
})

/* ==================== 数据获取 ==================== */

/** 根据当前路由 slug 获取文章详情，失败时跳转首页 */
const fetchData = async () => {
  const slug = route.params.slug as string
  if (!slug) return

  loading.value = true
  try {
    post.value = await getPostDetailApi(slug)

    // 数据加载完成后立即计算一次 TOC 高亮状态
    await nextTick()
    handleScroll()
  } catch (error) {
    console.error('Failed to fetch post:', error)
    await router.push('/')
  } finally {
    loading.value = false
  }
}

/* ==================== 生命周期 ==================== */

onMounted(() => {
  fetchData()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

/** 监听路由参数变化，支持文章间直接跳转（如上一篇/下一篇）而不重建组件 */
watch(
    () => route.params.slug,
    () => {
      if (route.name === 'PostDetail') {
        fetchData()
      }
    }
)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full">

      <!-- ==================== 加载骨架屏 ==================== -->
      <div v-if="loading" class="bento-card p-8 md:p-10 text-center">
        <div class="animate-pulse space-y-4">
          <div class="h-8 bg-slate-200 rounded w-3/4 mx-auto"></div>
          <div class="h-4 bg-slate-100 rounded w-1/2 mx-auto"></div>
          <div class="h-4 bg-slate-100 rounded w-2/3 mx-auto mt-8"></div>
          <div class="h-4 bg-slate-100 rounded w-full mx-auto"></div>
          <div class="h-4 bg-slate-100 rounded w-5/6 mx-auto"></div>
        </div>
      </div>

      <template v-else-if="post">

        <!-- ==================== 文章元信息头部 ==================== -->
        <div class="bento-card p-6 md:p-8 mb-6 flex flex-col gap-4">
          <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
            {{ post.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500 border-t border-slate-100 pt-4 mt-1">
            <!-- 发布日期 -->
            <div class="flex items-center gap-2 text-xs" title="Published">
              <Calendar :size="12" class="text-slate-400" />
              <span>{{ formatDate(post.createTime) }}</span>
            </div>

            <!-- 更新日期（仅当与发布日期不同天时显示） -->
            <div
                v-if="showUpdateDate"
                class="flex items-center gap-2 text-xs"
                title="Last Updated"
            >
              <PenLine :size="12" class="text-slate-400" />
              <span>{{ formatDate(post.updateTime) }}</span>
            </div>

            <!-- 预计阅读时长 -->
            <div v-if="post.readTime" class="flex items-center gap-2 text-xs">
              <Clock :size="12" class="text-slate-400" />
              <span>{{ post.readTime }} min read</span>
            </div>

            <!-- 浏览量 -->
            <div class="flex items-center gap-2 text-xs">
              <Eye :size="12" class="text-slate-400" />
              <span>{{ post.views }} views</span>
            </div>

            <!-- 标签列表（右对齐） -->
            <div v-if="post.tags?.length" class="flex items-center gap-2 ml-auto">
              <span
                  v-for="tag in post.tags"
                  :key="tag.id"
                  class="px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-500"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- ==================== 内容过期警告横幅 ==================== -->
        <div
            v-if="isOutdated"
            class="flex items-center gap-3 px-5 py-4 mb-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-800"
        >
          <AlertTriangle :size="18" class="shrink-0 text-amber-500" />
          <p class="text-sm">
            This article was last updated over 6 months ago. Some content may be outdated.
          </p>
        </div>

        <!-- ==================== 正文 + 侧边栏布局 ==================== -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <!-- 文章正文 -->
          <article class="lg:col-span-9">
            <div class="bento-card p-8 md:p-10 min-h-150">
              <!-- Markdown 渲染区域：使用 .markdown-body 基础密度样式 -->
              <div class="markdown-body" v-html="renderedContent"></div>
            </div>

            <!-- ==================== 上一篇 / 下一篇导航 ==================== -->
            <div
                v-if="post.previous || post.next"
                class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6"
            >
              <!-- 上一篇 -->
              <router-link
                  v-if="post.previous"
                  :to="{ name: 'PostDetail', params: { slug: post.previous.slug } }"
                  class="bento-card p-5 group hover:shadow-md transition-all"
              >
                <div class="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <ArrowLeft :size="12" class="transition-transform group-hover:-translate-x-1" />
                  <span>Previous</span>
                </div>
                <p class="text-sm font-medium text-slate-700 group-hover:text-slate-900 line-clamp-2 transition-colors">
                  {{ post.previous.title }}
                </p>
              </router-link>
              <!-- 占位：无上一篇时保持网格布局 -->
              <div v-else></div>

              <!-- 下一篇 -->
              <router-link
                  v-if="post.next"
                  :to="{ name: 'PostDetail', params: { slug: post.next.slug } }"
                  class="bento-card p-5 group hover:shadow-md transition-all text-right"
              >
                <div class="flex items-center justify-end gap-2 text-xs text-slate-400 mb-2">
                  <span>Next</span>
                  <ArrowRight :size="12" class="transition-transform group-hover:translate-x-1" />
                </div>
                <p class="text-sm font-medium text-slate-700 group-hover:text-slate-900 line-clamp-2 transition-colors">
                  {{ post.next.title }}
                </p>
              </router-link>
            </div>
          </article>

          <!-- ==================== 右侧栏：目录导航 ==================== -->
          <aside class="lg:col-span-3 relative hidden lg:block">
            <div class="sticky top-24 space-y-6">
              <!-- TOC 目录（仅在有标题时显示） -->
              <div v-if="toc.length > 0" class="bento-card p-6">
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                  Table of Contents
                </h3>
                <ul
                    ref="tocContainer"
                    class="space-y-0 relative scrollbar-thin overflow-y-auto scroll-smooth pr-2 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-100"
                    style="max-height: calc(100vh - 400px)"
                >
                  <li v-for="item in toc" :key="item.id">
                    <a
                        :href="'#' + item.id"
                        class="toc-link block py-1.5 text-sm text-slate-500 hover:text-slate-800 cursor-pointer truncate transition-all border-l-2 border-transparent"
                        :class="[
                        activeSection === item.id
                          ? 'active text-slate-900 font-semibold border-l-slate-900! bg-slate-50'
                          : '',
                        item.level === 3 ? 'pl-6' : 'pl-4',
                      ]"
                        @click.prevent="scrollTo(item.id)"
                    >
                      {{ item.text }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </template>
    </div>

    <!-- Mermaid 图表放大模态框 -->
    <MermaidModal />
  </div>
</template>

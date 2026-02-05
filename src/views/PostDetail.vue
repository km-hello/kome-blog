<!-- src/views/PostDetail.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, PenLine, Clock, ArrowLeft, ArrowRight, Eye, X, ZoomIn, ZoomOut, RotateCcw, AlertTriangle } from 'lucide-vue-next'
import AppHeader from '@/components/layout/AppHeader.vue'
import { getPostDetailApi, type PostDetailResponse } from '@/api/post'
import { useMarkdown } from '@/composables/useMarkdown'

const route = useRoute()
const router = useRouter()
const { render, toc, renderMermaidCharts } = useMarkdown()

const post = ref<PostDetailResponse | null>(null)
const loading = ref(true)
const activeSection = ref('')
const tocContainer = ref<HTMLElement | null>(null)

// Mermaid 放大查看
const mermaidModalOpen = ref(false)
const mermaidModalContent = ref('')
const mermaidZoom = ref(1)
const mermaidSvgOriginalWidth = ref(0)
const mermaidSvgOriginalHeight = ref(0)

const openMermaidModal = (svgContent: string) => {
  // 解析原始 SVG 尺寸
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')
  const svg = doc.querySelector('svg')
  if (!svg) return

  // 获取原始尺寸，优先从 width/height 属性读取，否则从 viewBox 读取
  let w = parseFloat(svg.getAttribute('width') || '0')
  let h = parseFloat(svg.getAttribute('height') || '0')
  if (!w || !h) {
    const vb = svg.getAttribute('viewBox')?.split(/\s+/).map(Number)
    if (vb && vb.length === 4) {
      w = vb[2]
      h = vb[3]
    }
  }

  mermaidSvgOriginalWidth.value = w || 600
  mermaidSvgOriginalHeight.value = h || 400

  // 移除 SVG 上的固定尺寸，改用 CSS 控制
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  svg.setAttribute('style', 'width: 100%; height: 100%;')

  mermaidModalContent.value = svg.outerHTML
  mermaidZoom.value = 1
  mermaidModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeMermaidModal = () => {
  mermaidModalOpen.value = false
  mermaidModalContent.value = ''
  mermaidZoom.value = 1
  document.body.style.overflow = ''
}

const mermaidDisplayWidth = computed(() => mermaidSvgOriginalWidth.value * mermaidZoom.value)
const mermaidDisplayHeight = computed(() => mermaidSvgOriginalHeight.value * mermaidZoom.value)

const zoomIn = () => {
  mermaidZoom.value = Math.min(mermaidZoom.value + 0.25, 5)
}

const zoomOut = () => {
  mermaidZoom.value = Math.max(mermaidZoom.value - 0.25, 0.25)
}

const resetZoom = () => {
  mermaidZoom.value = 1
}

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-')
}

// 只比较日期部分（YYYY-MM-DD），判断更新日期是否与发布日期不同
const showUpdateDate = computed(() => {
  if (!post.value?.updateTime || !post.value?.createTime) return false
  return post.value.updateTime.slice(0, 10) !== post.value.createTime.slice(0, 10)
})

// 内容过期提醒：距上次更新超过 180 天
const isOutdated = computed(() => {
  if (!post.value) return false
  const ref = post.value.updateTime || post.value.createTime
  if (!ref) return false
  const diffMs = Date.now() - new Date(ref).getTime()
  return diffMs > 180 * 24 * 60 * 60 * 1000
})

// 渲染 Markdown
const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return render(post.value.content)
})

// 监听内容渲染完成后，渲染 Mermaid 图表
watch(renderedContent, async (newVal) => {
  if (!newVal) return
  await nextTick()
  await renderMermaidCharts()
})

// 滚动到指定锚点
const scrollTo = (id: string) => {
  activeSection.value = id
  const element = document.getElementById(id)
  if (element) {
    const headerOffset = 100
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
  }
}

// 监听滚动更新 TOC 高亮
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
    const firstHeader = headers[0] as HTMLElement
    if (firstHeader.id) {
      activeSection.value = firstHeader.id
    }
  }
}

// TOC 自动滚动到当前项
watch(activeSection, async (newVal) => {
  if (!newVal || !tocContainer.value) return
  await nextTick()

  const activeLink = tocContainer.value.querySelector('.toc-link.active')
  if (activeLink) {
    const el = activeLink as HTMLElement
    const top = el.offsetTop - tocContainer.value.offsetHeight / 2 + el.offsetHeight / 2
    tocContainer.value.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }
})

// 获取数据
const fetchData = async () => {
  const slug = route.params.slug as string
  if (!slug) return

  loading.value = true
  try {
    post.value = await getPostDetailApi(slug)

    await nextTick()
    handleScroll()
  } catch (error) {
    console.error('Failed to fetch post:', error)
    router.push('/')
  } finally {
    loading.value = false
  }
}

// 代码块复制按钮（事件委托）
const handleCopyClick = (e: MouseEvent) => {
  const btn = (e.target as HTMLElement).closest('.code-copy-btn') as HTMLElement | null
  if (!btn) return

  const code = btn.getAttribute('data-code')
    ?.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  if (!code) return

  navigator.clipboard.writeText(code).then(() => {
    btn.classList.add('copied')
    setTimeout(() => btn.classList.remove('copied'), 2000)
  })
}

// Mermaid 图表点击放大（事件委托）
const handleMermaidClick = (e: MouseEvent) => {
  const container = (e.target as HTMLElement).closest('.mermaid-container.mermaid-rendered') as HTMLElement | null
  if (!container) return

  const svg = container.querySelector('svg')
  if (svg) {
    openMermaidModal(svg.outerHTML)
  }
}

// ESC 键关闭模态框
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && mermaidModalOpen.value) {
    closeMermaidModal()
  }
}

// 鼠标滚轮缩放
const handleWheel = (e: WheelEvent) => {
  if (!mermaidModalOpen.value) return
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    // 根据滚轮 delta 计算缩放，每次变化约 5%
    const delta = -e.deltaY * 0.001
    const newZoom = Math.min(5, Math.max(0.25, mermaidZoom.value + delta))
    mermaidZoom.value = Math.round(newZoom * 100) / 100
  }
}

onMounted(() => {
  fetchData()
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleCopyClick)
  document.addEventListener('click', handleMermaidClick)
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('wheel', handleWheel, { passive: false })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleCopyClick)
  document.removeEventListener('click', handleMermaidClick)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('wheel', handleWheel)
  document.body.style.overflow = ''
})

// 监听路由变化
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
  <div class="min-h-screen flex flex-col bg-[#f2f4f7]">
    <AppHeader />

    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full">
      <!-- Loading State -->
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
        <!-- Meta Header -->
        <div class="bento-card p-6 md:p-8 mb-6 flex flex-col gap-4">
          <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
            {{ post.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500 border-t border-slate-100 pt-4 mt-1">
            <!-- Published Date -->
            <div class="flex items-center gap-2 text-xs" title="Published">
              <Calendar :size="12" class="text-slate-400" />
              <span>{{ formatDate(post.createTime) }}</span>
            </div>

            <!-- Updated Date -->
            <div
                v-if="showUpdateDate"
                class="flex items-center gap-2 text-xs"
                title="Last Updated"
            >
              <PenLine :size="12" class="text-slate-400" />
              <span>{{ formatDate(post.updateTime) }}</span>
            </div>

            <!-- Read Time -->
            <div v-if="post.readTime" class="flex items-center gap-2 text-xs">
              <Clock :size="12" class="text-slate-400" />
              <span>{{ post.readTime }} min read</span>
            </div>

            <!-- Views -->
            <div class="flex items-center gap-2 text-xs">
              <Eye :size="12" class="text-slate-400" />
              <span>{{ post.views }} views</span>
            </div>

            <!-- Tags -->
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

        <!-- Outdated Warning Banner -->
        <div
            v-if="isOutdated"
            class="flex items-center gap-3 px-5 py-4 mb-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-800"
        >
          <AlertTriangle :size="18" class="shrink-0 text-amber-500" />
          <p class="text-sm">
            This article was last updated over 6 months ago. Some content may be outdated.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Article Content -->
          <article class="lg:col-span-9">
            <div class="bento-card p-8 md:p-10 min-h-[600px]">
              <div class="markdown-body" v-html="renderedContent"></div>
            </div>

            <!-- Previous / Next Navigation -->
            <div
                v-if="post.previous || post.next"
                class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6"
            >
              <!-- Previous -->
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
              <div v-else></div>

              <!-- Next -->
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

          <!-- Sidebar -->
          <aside class="lg:col-span-3 relative hidden lg:block">
            <div class="sticky top-24 space-y-6">
              <!-- Table of Contents -->
              <div v-if="toc.length > 0" class="bento-card p-6">
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Table of Contents
                </h3>
                <ul
                    ref="tocContainer"
                    class="space-y-0 relative custom-scroll pr-2"
                    style="max-height: calc(100vh - 400px)"
                >
                  <div class="absolute left-0 top-0 bottom-0 w-px bg-slate-100"></div>
                  <li v-for="item in toc" :key="item.id">
                    <a
                        :href="'#' + item.id"
                        class="toc-link block py-1.5 text-sm text-slate-500 hover:text-slate-800 cursor-pointer truncate transition-all border-l-2 border-transparent"
                        :class="[
                        activeSection === item.id
                          ? 'active text-slate-900 font-semibold !border-l-slate-900 bg-slate-50'
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

    <!-- Mermaid 放大模态框 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
            v-if="mermaidModalOpen"
            class="fixed inset-0 z-50 flex items-center justify-center"
            @click.self="closeMermaidModal"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeMermaidModal"></div>
          <div class="relative w-[70vw] h-[70vh] bg-white rounded-xl shadow-2xl flex flex-col">
            <!-- 工具栏 -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <button
                    class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                    title="Ctrl + Scroll Down"
                    @click="zoomOut"
                >
                  <ZoomOut :size="18" />
                </button>
                <span class="text-sm text-slate-600 min-w-[4rem] text-center">{{ Math.round(mermaidZoom * 100) }}%</span>
                <button
                    class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                    title="Ctrl + Scroll Up"
                    @click="zoomIn"
                >
                  <ZoomIn :size="18" />
                </button>
                <button
                    class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                    title="Reset"
                    @click="resetZoom"
                >
                  <RotateCcw :size="18" />
                </button>
              </div>
              <button
                  class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  title="Close (Esc)"
                  @click="closeMermaidModal"
              >
                <X :size="18" />
              </button>
            </div>
            <!-- 内容区 -->
            <div class="flex-1 overflow-auto p-6 bg-slate-50">
              <div class="inline-flex min-h-full min-w-full items-center justify-center">
                <div
                    class="mermaid-modal-content shrink-0 transition-[width,height] duration-200"
                    :style="{ width: mermaidDisplayWidth + 'px', height: mermaidDisplayHeight + 'px' }"
                    v-html="mermaidModalContent"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Custom Scrollbar */
.custom-scroll {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
  scroll-behavior: smooth;
}
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 4px;
}
.custom-scroll:hover::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
}

/* Modal 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Mermaid 模态框内容 */
.mermaid-modal-content :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
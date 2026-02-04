<!-- src/views/PostDetail.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, PenLine, Clock, ArrowLeft, Eye } from 'lucide-vue-next'
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

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-')
}

// 渲染 Markdown
const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return render(post.value.content)
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
    // 渲染 Mermaid 图表
    await renderMermaidCharts()
    handleScroll()
  } catch (error) {
    console.error('Failed to fetch post:', error)
    router.push('/')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
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

          <div
              class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500 border-t border-slate-100 pt-4 mt-1"
          >
            <!-- Published Date -->
            <div class="flex items-center gap-2 text-xs" title="Published">
              <Calendar :size="12" class="text-slate-400" />
              <span>{{ formatDate(post.createTime) }}</span>
            </div>

            <!-- Updated Date -->
            <div
                v-if="post.updateTime && post.updateTime !== post.createTime"
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
                  class="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-600"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Article Content -->
          <article class="lg:col-span-9">
            <div class="bento-card p-8 md:p-10 min-h-[600px]">
              <div class="markdown-body" v-html="renderedContent"></div>
            </div>

            <!-- Back to Home -->
            <div class="bento-card p-6 md:p-8 mt-6">
              <router-link
                  to="/"
                  class="group flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft :size="14" class="transition-transform group-hover:-translate-x-1" />
                <span>Back to Home</span>
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
                    style="max-height: calc(100vh - 300px)"
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
</style>
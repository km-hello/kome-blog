<!--
  PostCard.vue - 文章卡片

  功能：
    - 展示文章摘要信息：日期、标题、摘要、封面图、标签、阅读时间、浏览量
    - 置顶文章标题前显示 Pin 图标
    - 封面图懒加载，加载前显示骨架动画

  Props:
    - post: 文章简要数据（PostSimpleResponse）

  响应式：
    - < md: 日期紧凑行内显示，封面图全宽堆叠在文字下方
    - >= md: 左侧竖排日期列（含装饰线），封面图缩略在右侧
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { Clock, Eye, Pin } from 'lucide-vue-next'
import type { PostSimpleResponse } from '@/api/post'

const props = defineProps<{
  post: PostSimpleResponse
}>()

const imageLoaded = ref(false)

/**
 * 格式化文章发布日期（显示为 DD MMM YYYY 格式）
 */
const formattedDate = computed(() => {
  const date = new Date(props.post.createTime)
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return {
    day: date.getDate().toString().padStart(2, '0'),
    month: months[date.getMonth()],
    year: date.getFullYear().toString(),
  }
})
</script>

<template>
  <!--
    文章卡片容器
    布局：< md 纵向堆叠（日期行 → 内容 → 封面） / >= md 横向三栏（日期列 | 标题+摘要 | 封面缩略图）
    交互：整卡 group hover 联动标题下划线、日期颜色变化
  -->
  <article class="bento-card p-5 sm:p-6 md:p-8 flex flex-col md:flex-row gap-5 md:gap-8 group cursor-pointer">
    <!--
      日期列
      - < md: 横向行内排列（DD MMM YYYY），底部分割线
      - >= md: 竖排显示（日/月/年），右侧分割线 + 渐变装饰竖线
    -->
    <div class="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start w-full md:w-20 shrink-0 text-gray-400 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
      <div class="flex md:block items-baseline gap-2 text-center md:text-left">
        <!-- 日（两位数） -->
        <span class="text-2xl block font-semibold text-slate-800 leading-none group-hover:text-slate-900 transition-colors">
          {{ formattedDate.day }}
        </span>
        <!-- 月（三字母缩写） -->
        <span class="text-[10px] font-bold uppercase tracking-widest md:mt-1.5 block text-gray-400">
          {{ formattedDate.month }}
        </span>
        <!-- 年（四位数字） -->
        <span class="text-[10px] font-medium tracking-wider md:mt-0.5 block text-slate-300 group-hover:text-slate-400 transition-colors">
          {{ formattedDate.year }}
        </span>
      </div>
      <!-- 桌面端装饰竖线（渐变消隐） -->
      <div class="hidden md:block w-1 h-8 bg-linear-to-b from-gray-200 to-transparent mt-4"></div>
    </div>

    <!-- 右侧内容区（标题 + 摘要 + 封面 + 元信息） -->
    <div class="flex-1 flex flex-col">
      <!-- 上半部分：标题摘要 + 封面图（< md 堆叠 / >= md 左文右图） -->
      <div class="flex flex-col md:flex-row gap-4 md:gap-6 mb-4 md:mb-5">
        <!-- 标题与摘要 -->
        <div class="flex-1 flex flex-col justify-start">
          <router-link :to="`/post/${post.slug}`">
            <h2 class="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900 mb-2.5 md:mb-3 leading-tight decoration-2 decoration-slate-300 underline-offset-4 group-hover:underline transition-all">
              <!-- 置顶图标（仅置顶文章显示） -->
              <Pin v-if="post.isPinned" :size="16" class="inline-block mr-1.5 -mt-0.5 text-slate-400" />
              {{ post.title }}
            </h2>
          </router-link>
          <!-- 摘要（移动端最多 2 行，sm+ 最多 3 行） -->
          <p class="text-gray-500 text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
            {{ post.summary }}
          </p>
        </div>

        <!-- 封面图（懒加载，加载前显示 pulse 骨架动画；< md 全宽 / >= md 固定 40x28 缩略图） -->
        <div v-if="post.coverImage" class="w-full h-40 sm:h-44 md:w-40 md:h-28 shrink-0 overflow-hidden rounded-lg bg-slate-100" :class="{ 'animate-pulse': !imageLoaded }">
          <img :src="post.coverImage" class="size-full object-cover" alt="Cover" loading="lazy" @load="imageLoaded = true">
        </div>
      </div>

      <!-- 底部元信息栏：左侧阅读时间+浏览量，右侧标签列表 -->
      <div class="mt-auto pt-4 md:pt-5 border-t border-gray-50 flex flex-wrap justify-between items-center gap-2.5 md:gap-3">
        <!-- 阅读时间 & 浏览量 -->
        <div class="flex items-center gap-4 text-xs text-gray-400 font-mono">
          <span v-if="post.readTime" class="flex items-center gap-1.5">
            <Clock :size="12" />{{ post.readTime }}min
          </span>
          <span class="flex items-center gap-1.5">
            <Eye :size="12" />{{ post.views }}
          </span>
        </div>
        <!-- 标签列表 -->
        <div class="flex flex-wrap gap-1.5 md:gap-2">
          <span
              v-for="tag in post.tags"
              :key="tag.id"
              class="px-2.5 py-0.5 md:py-1 rounded-md text-[10px] font-bold tracking-wider bg-slate-50 border border-slate-100 text-slate-400 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

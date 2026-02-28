<!-- PostCard.vue - 文章卡片 -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { Clock, Eye, Pin } from 'lucide-vue-next'
import type { PostSimpleResponse } from '@/api/post'

/**
 * Props 定义
 * @property post 文章简要数据（PostSimpleResponse）
 */
const props = defineProps<{
  post: PostSimpleResponse
}>()

/**
 * 封面图加载完成标志（控制骨架动画）
 */
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
  <!-- 文章卡片（< md 纵向堆叠 / >= md 横向三栏，padding 响应式 p-5 → sm:p-6 → md:p-8） -->
  <article class="bento-card p-5 sm:p-6 md:p-8 flex flex-col md:flex-row gap-5 md:gap-8 group cursor-pointer">
    <!-- 日期列（< md 横排行内 / >= md 竖排左侧含装饰线） -->
    <div class="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start w-full md:w-20 shrink-0 text-gray-400 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
      <div class="flex md:block items-baseline gap-2 text-center md:text-left">
        <span class="text-2xl block font-semibold text-slate-800 leading-none group-hover:text-slate-900 transition-colors">
          {{ formattedDate.day }}
        </span>
        <span class="text-[10px] font-bold uppercase tracking-widest md:mt-1.5 block text-gray-400">
          {{ formattedDate.month }}
        </span>
        <span class="text-[10px] font-medium tracking-wider md:mt-0.5 block text-slate-300 group-hover:text-slate-400 transition-colors">
          {{ formattedDate.year }}
        </span>
      </div>
      <div class="hidden md:block w-1 h-8 bg-linear-to-b from-gray-200 to-transparent mt-4"></div>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 flex flex-col">
      <!-- 标题摘要 + 封面图（< md 封面全宽堆叠 / >= md 封面缩略右侧） -->
      <div class="flex flex-col md:flex-row gap-4 md:gap-6 mb-4 md:mb-5">
        <div class="flex-1 flex flex-col justify-start">
          <router-link :to="`/post/${post.slug}`">
            <h2 class="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900 mb-2.5 md:mb-3 leading-tight decoration-2 decoration-slate-300 underline-offset-4 group-hover:underline transition-all">
              <Pin v-if="post.isPinned" :size="16" class="inline-block mr-1.5 -mt-0.5 text-slate-400" />
              {{ post.title }}
            </h2>
          </router-link>
          <p class="text-gray-500 text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
            {{ post.summary }}
          </p>
        </div>

        <!-- 封面图（< md 全宽 h-40/sm:h-44 / >= md 缩略 w-40 h-28，懒加载） -->
        <div v-if="post.coverImage" class="w-full h-40 sm:h-44 md:w-40 md:h-28 shrink-0 overflow-hidden rounded-lg bg-slate-100" :class="{ 'animate-pulse': !imageLoaded }">
          <img :src="post.coverImage" class="size-full object-cover" alt="Cover" loading="lazy" @load="imageLoaded = true">
        </div>
      </div>

      <!-- 元信息栏 -->
      <div class="mt-auto pt-4 md:pt-5 border-t border-gray-50 flex flex-wrap justify-between items-center gap-2.5 md:gap-3">
        <div class="flex items-center gap-4 text-xs text-gray-400 font-mono">
          <span v-if="post.readTime" class="flex items-center gap-1.5">
            <Clock :size="12" />{{ post.readTime }}min
          </span>
          <span class="flex items-center gap-1.5">
            <Eye :size="12" />{{ post.views }}
          </span>
        </div>
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

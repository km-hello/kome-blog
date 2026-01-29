<!-- src/components/home/PostCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Eye } from 'lucide-vue-next'
import type { PostSimpleResponse } from '@/api/post'

const props = defineProps<{
  post: PostSimpleResponse
}>()

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
  <article class="bg-white rounded-xl border border-black/5 shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 group cursor-pointer hover:border-black/10 transition-colors">
    <!-- Date Column -->
    <div class="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start w-full md:w-20 shrink-0 text-gray-400 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
      <div class="text-center md:text-left">
        <span class="text-3xl block font-bold text-slate-800 leading-none group-hover:text-slate-900 transition-colors">
          {{ formattedDate.day }}
        </span>
        <span class="text-[10px] font-bold uppercase tracking-widest mt-1.5 block text-gray-400">
          {{ formattedDate.month }}
        </span>
        <span class="text-[10px] font-medium tracking-wider mt-0.5 block text-slate-300 group-hover:text-slate-400 transition-colors">
          {{ formattedDate.year }}
        </span>
      </div>
      <div class="hidden md:block w-1 h-8 bg-gradient-to-b from-gray-200 to-transparent mt-4"></div>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col">
      <div class="flex flex-col md:flex-row gap-6 mb-5">
        <div class="flex-1 flex flex-col justify-start">
          <router-link :to="`/post/${post.slug}`">
            <h2 class="text-xl md:text-2xl font-bold text-slate-900 mb-3 leading-tight decoration-2 decoration-slate-300 underline-offset-4 group-hover:underline transition-all">
              {{ post.title }}
            </h2>
          </router-link>
          <p class="text-gray-500 text-sm leading-relaxed line-clamp-3">
            {{ post.summary }}
          </p>
        </div>

        <div v-if="post.coverImage" class="hidden md:block w-40 h-28 shrink-0 overflow-hidden rounded-lg bg-slate-50">
          <img :src="post.coverImage" class="size-full object-cover" alt="Cover" loading="lazy">
        </div>

        <div v-if="post.coverImage" class="md:hidden w-full h-48 overflow-hidden rounded-lg bg-slate-50 mt-2">
          <img :src="post.coverImage" class="size-full object-cover" alt="Cover" loading="lazy">
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-auto pt-5 border-t border-gray-50 flex flex-wrap justify-between items-center gap-3">
        <div class="flex items-center gap-4 text-xs text-gray-400 font-mono">
          <span v-if="post.readTime" class="flex items-center gap-1.5">
            <Clock :size="12" />{{ post.readTime }}min
          </span>
          <span class="flex items-center gap-1.5">
            <Eye :size="12" />{{ post.views }}
          </span>
        </div>
        <div class="flex gap-2">
          <span
              v-for="tag in post.tags"
              :key="tag.id"
              class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors cursor-pointer"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
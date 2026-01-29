<!-- src/components/sidebar/ProfileCard.vue -->
<script setup lang="ts">
import { Github, Twitter, Mail, Rss } from 'lucide-vue-next'
import type { OwnerInfo, SiteStats } from '@/api/site'

defineProps<{
  owner: OwnerInfo
  stats: SiteStats
}>()

const defaultAvatar = 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix'
</script>

<template>
  <div class="bento-card p-6">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <div class="size-14 rounded-full p-1 bg-white border border-gray-100 shadow-sm overflow-hidden shrink-0">
        <img
            :src="owner.avatar || defaultAvatar"
            :alt="owner.nickname"
            class="size-full bg-slate-50 rounded-full"
        >
      </div>
      <div>
        <h3 class="font-bold text-slate-900 text-lg">{{ owner.nickname }}</h3>
        <p v-if="owner.description" class="text-xs text-slate-500">{{ owner.description }}</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-2">
      <div class="text-center py-2 rounded-lg cursor-default group hover:bg-slate-50 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.publishedPostCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">POSTS</div>
      </div>
      <div class="text-center py-2 rounded-lg cursor-default group hover:bg-slate-50 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.usedTagCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">TAGS</div>
      </div>
      <div class="text-center py-2 rounded-lg cursor-default group hover:bg-slate-50 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.publishedMemoCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">MEMOS</div>
      </div>
      <div class="text-center py-2 rounded-lg cursor-default group hover:bg-slate-50 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.publishedLinkCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">LINKS</div>
      </div>
    </div>

    <div class="border-t border-gray-100 mt-3 mb-5 mx-1"></div>

    <!-- Social Links -->
    <div class="grid grid-cols-4 gap-2">
      <a href="#" class="flex items-center justify-center h-10 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-200 hover:text-slate-900 transition-colors" title="GitHub"><Github :size="18" /></a>
      <a href="#" class="flex items-center justify-center h-10 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-200 hover:text-slate-900 transition-colors" title="Twitter"><Twitter :size="18" /></a>
      <a href="#" class="flex items-center justify-center h-10 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-200 hover:text-slate-900 transition-colors" title="Email"><Mail :size="18" /></a>
      <a href="#" class="flex items-center justify-center h-10 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-200 hover:text-slate-900 transition-colors" title="RSS"><Rss :size="18" /></a>
    </div>
  </div>
</template>
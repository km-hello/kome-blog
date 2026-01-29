<!-- src/components/sidebar/MemoPreview.vue -->
<script setup lang="ts">
import { StickyNote } from 'lucide-vue-next'
import type { MemoResponse } from '@/api/memo'

defineProps<{
  memos: MemoResponse[]
}>()

const formatDate = (dateStr: string): string => {
  return dateStr.split('T')[0]
}
</script>

<template>
  <div class="bg-white rounded-xl border border-black/5 shadow-sm px-5 py-5">
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Latest Memos</h4>
    </div>

    <div class="space-y-3">
      <router-link
          v-for="memo in memos"
          :key="memo.id"
          to="/memos"
          class="p-3 rounded-lg block bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
      >
        <div class="flex gap-3 items-start">
          <StickyNote :size="12" class="text-slate-300 mt-1 shrink-0" />
          <div>
            <p class="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">
              {{ memo.content }}
            </p>
            <div class="flex items-center gap-2 mt-2">
              <span class="size-1 bg-slate-300 rounded-full"></span>
              <span class="text-[10px] text-slate-400 font-mono tracking-tight">
                {{ formatDate(memo.createTime) }}
              </span>
            </div>
          </div>
        </div>
      </router-link>
    </div>

    <div v-if="memos.length === 0" class="text-center py-4 text-xs text-slate-400">
      No memos yet
    </div>
  </div>
</template>
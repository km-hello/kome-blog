<!-- src/components/sidebar/LatestMemo.vue -->
<script setup lang="ts">
import { StickyNote } from 'lucide-vue-next'
import type { MemoResponse } from '@/api/memo'
import { useMarkdown } from '@/composables/useMarkdown'

defineProps<{
  memos: MemoResponse[]
}>()

const { render } = useMarkdown()

const formatDate = (dateStr: string): string => {
  return dateStr.split('T')[0]
}
</script>

<template>
  <div class="bento-card px-5 py-5">
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Latest Memos</h4>
    </div>

    <div class="space-y-3">
      <router-link
          v-for="memo in memos"
          :key="memo.id"
          to="/memos"
          class="p-3 rounded-lg block bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors group"
      >
        <div class="flex gap-3 items-start">
          <StickyNote :size="12" class="text-slate-300 mt-1 shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="memo-preview-content relative">
              <div class="markdown-body markdown-mini" v-html="render(memo.content)"></div>
              <div class="memo-fade"></div>
            </div>
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

<style scoped>
.memo-preview-content {
  max-height: 4.5em;
  overflow: hidden;
  position: relative;
}

.memo-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.5em;
  background: linear-gradient(to bottom, transparent, #f8fafc);
  pointer-events: none;
}
</style>

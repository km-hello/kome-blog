<!-- src/components/sidebar/MemoPreview.vue -->
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
      <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Latest Memos</h4>
    </div>

    <div class="space-y-3">
      <router-link
          v-for="memo in memos"
          :key="memo.id"
          to="/memos"
          class="p-3 rounded-lg block bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors group"
      >
        <div class="flex gap-3 items-start">
          <StickyNote :size="12" class="text-slate-300 mt-1 shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="memo-preview-content relative">
              <div class="markdown-body" v-html="render(memo.content)"></div>
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

/* Memo 预览内容样式 */
.memo-preview-content :deep(.markdown-body) {
  font-size: 12px;
  line-height: 1.5;
  color: #475569;
}

.memo-preview-content :deep(p) {
  margin: 0.25em 0;
}

.memo-preview-content :deep(p:first-child) {
  margin-top: 0;
}

.memo-preview-content :deep(ul),
.memo-preview-content :deep(ol) {
  margin: 0.25em 0;
  padding-left: 1.25em;
}

.memo-preview-content :deep(li) {
  margin: 0.125em 0;
}

.memo-preview-content :deep(code):not(pre code) {
  font-size: 11px;
  padding: 0.1em 0.3em;
}

.memo-preview-content :deep(.code-block) {
  margin: 0.5em 0;
}

.memo-preview-content :deep(pre) {
  font-size: 11px;
  padding: 0.5em;
}

.memo-preview-content :deep(blockquote) {
  margin: 0.25em 0;
  padding: 0.25em 0.75em;
  font-size: 11px;
}

.memo-preview-content :deep(h1),
.memo-preview-content :deep(h2),
.memo-preview-content :deep(h3),
.memo-preview-content :deep(h4),
.memo-preview-content :deep(h5),
.memo-preview-content :deep(h6) {
  font-size: 12px;
  margin: 0.25em 0;
}

.memo-preview-content :deep(a) {
  color: #64748b;
}

.memo-preview-content :deep(img) {
  max-height: 3em;
  border-radius: 4px;
}
</style>
<!-- src/components/sidebar/TopicList.vue -->
<script setup lang="ts">
import type { TagPostCountResponse } from '@/api/tag'

defineProps<{
  tags: TagPostCountResponse[]
  activeTagId?: number | null
}>()

const emit = defineEmits<{
  select: [tagId: number | null]
}>()

const handleTagClick = (tagId: number) => {
  emit('select', tagId)
}
</script>

<template>
  <div class="bento-card px-5 py-5">
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Topics</h4>
      <button
          v-if="activeTagId"
          @click="emit('select', null)"
          class="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
      >
        Clear
      </button>
    </div>

    <div class="flex flex-wrap gap-2 max-h-60 overflow-y-auto scrollbar-thin pr-1">
      <button
          v-for="tag in tags"
          :key="tag.id"
          @click="handleTagClick(tag.id)"
          class="px-3 py-1.5 rounded-md flex items-center gap-2 cursor-pointer border transition-colors"
          :class="activeTagId === tag.id
            ? 'bg-slate-800 border-slate-700 text-white'
            : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900'"
      >
        <span class="text-xs font-bold">{{ tag.name }}</span>
        <span
            class="text-[10px] font-mono px-1.5 rounded"
            :class="activeTagId === tag.id
              ? 'bg-slate-700 text-slate-300 border border-slate-600'
              : 'bg-white text-slate-400 border border-slate-200'"
        >
          {{ tag.postCount }}
        </span>
      </button>
    </div>

    <div v-if="tags.length === 0" class="text-center py-4 text-xs text-slate-400">
      No tags yet
    </div>
  </div>
</template>
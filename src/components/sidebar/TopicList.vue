<!-- src/components/sidebar/TopicList.vue -->
<script setup lang="ts">
import type { TagPostCountResponse } from '@/api/tag'

defineProps<{
  tags: TagPostCountResponse[]
}>()
</script>

<template>
  <div class="bento-card px-5 py-5">
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Topics</h4>
    </div>

    <div class="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1">
      <router-link
          v-for="tag in tags"
          :key="tag.id"
          :to="{ path: '/archive', query: { tagId: tag.id } }"
          class="px-3 py-1.5 rounded-md flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-100 text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
      >
        <span class="text-xs font-bold">{{ tag.name }}</span>
        <span class="border border-slate-200 text-[10px] font-mono px-1.5 rounded text-slate-400 bg-white">
          {{ tag.postCount }}
        </span>
      </router-link>
    </div>

    <div v-if="tags.length === 0" class="text-center py-4 text-xs text-slate-400">
      No tags yet
    </div>
  </div>
</template>
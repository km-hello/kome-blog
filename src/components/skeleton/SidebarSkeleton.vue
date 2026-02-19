<!-- src/components/skeleton/SidebarSkeleton.vue -->
<script setup lang="ts">
defineProps<{
  variant?: 'tags' | 'memos'
}>()
</script>

<template>
  <div class="animate-pulse">
    <!-- Tags variant: pill-shaped skeletons -->
    <template v-if="variant === 'tags'">
      <div class="flex flex-wrap gap-2">
        <div v-for="i in 6" :key="i" class="h-8 rounded-md bg-slate-50" :style="{ width: `${50 + (i * 13) % 40}px` }" />
      </div>
    </template>

    <!-- Memos variant: mini card skeletons -->
    <template v-else>
      <div class="space-y-3">
        <div v-for="i in 2" :key="i" class="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
          <div class="h-3 bg-slate-100 rounded w-full" />
          <div class="h-3 bg-slate-100 rounded w-4/5" />
          <div class="h-2.5 bg-slate-50 rounded w-16 mt-2" />
        </div>
      </div>
    </template>
  </div>
</template>

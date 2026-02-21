<!-- src/components/common/PageTitleCard.vue -->
<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  count?: number
  countLabel?: string
}>()
</script>

<template>
  <div class="bento-card p-5 sm:p-6 md:p-8 flex items-center justify-between">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">{{ title }}</h1>
      <p class="text-sm text-slate-500 mt-2">{{ subtitle }}</p>
    </div>
    <div v-if="count != null" class="text-right shrink-0">
      <div class="text-4xl font-bold text-slate-900">{{ count }}</div>
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{{ countLabel }}</div>
    </div>
  </div>
</template>
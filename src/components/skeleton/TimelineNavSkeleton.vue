<!-- src/components/skeleton/TimelineNavSkeleton.vue -->
<template>
  <div class="bento-card px-5 py-5 animate-pulse">
    <div class="flex justify-between items-center mb-4">
      <div class="h-3 w-16 bg-slate-100 rounded" />
    </div>
    <div class="relative pl-1">
      <div class="absolute left-4.25 top-2 bottom-2 w-px bg-slate-100"></div>
      <div class="flex flex-col gap-1">
        <div v-for="i in 3" :key="i" class="relative pl-4 flex justify-between items-center py-1.5 border-l-2 border-transparent">
          <div class="h-4 w-10 bg-slate-100 rounded" />
          <div class="h-4 w-8 bg-slate-50 border border-slate-100 rounded" />
        </div>
      </div>
    </div>
  </div>
</template>

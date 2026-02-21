<!-- src/components/skeleton/SkillCardSkeleton.vue -->
<template>
  <div class="bento-card p-5 animate-pulse">
    <div class="h-3 w-12 bg-slate-100 rounded mb-4" />
    <div class="space-y-3">
      <div class="flex flex-wrap gap-1.5">
        <div v-for="i in 4" :key="'a'+i" class="h-5 rounded bg-slate-100" :style="{ width: `${40 + i * 12}px` }" />
      </div>
      <div class="flex flex-wrap gap-1.5">
        <div v-for="i in 3" :key="'b'+i" class="h-5 rounded bg-slate-50 border border-slate-100" :style="{ width: `${36 + i * 10}px` }" />
      </div>
      <div class="flex flex-wrap gap-1.5">
        <div v-for="i in 2" :key="'c'+i" class="h-5 rounded bg-slate-50 border border-slate-100" :style="{ width: `${44 + i * 8}px` }" />
      </div>
    </div>
    <div class="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
      <div v-for="i in 3" :key="i" class="flex items-center gap-1.5">
        <div class="size-2 rounded-full bg-slate-100" />
        <div class="h-2 w-10 bg-slate-50 rounded" />
      </div>
    </div>
  </div>
</template>

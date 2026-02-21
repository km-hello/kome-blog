<!-- src/components/skeleton/MemoStatsSkeleton.vue -->
<template>
  <div class="bento-card p-5 animate-pulse">
    <div class="h-3 w-20 bg-slate-100 rounded mb-4" />
    <div class="grid grid-cols-2 gap-2">
      <div v-for="i in 4" :key="i" class="text-center py-3 rounded-lg bg-slate-50 border border-slate-100">
        <div class="h-5 w-8 bg-slate-100 rounded mx-auto" />
        <div class="h-2 w-12 bg-slate-50 rounded mx-auto mt-2" />
      </div>
    </div>
  </div>
</template>

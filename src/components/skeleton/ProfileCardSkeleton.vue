<!-- src/components/skeleton/ProfileCardSkeleton.vue -->
<template>
  <div class="bento-card p-6 animate-pulse">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <div class="size-14 rounded-full bg-slate-100 shrink-0" />
      <div class="space-y-2">
        <div class="h-5 w-24 bg-slate-100 rounded" />
        <div class="h-3 w-32 bg-slate-50 rounded" />
      </div>
    </div>
    <!-- Stats -->
    <div class="grid grid-cols-4 gap-1.5 sm:gap-2">
      <div v-for="i in 4" :key="i" class="text-center py-2 rounded-lg bg-slate-50 border border-slate-100">
        <div class="h-5 w-6 bg-slate-100 rounded mx-auto" />
        <div class="h-2 w-10 bg-slate-50 rounded mx-auto mt-2" />
      </div>
    </div>
  </div>
</template>

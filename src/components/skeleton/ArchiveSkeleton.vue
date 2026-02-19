<!-- src/components/skeleton/ArchiveSkeleton.vue -->
<template>
  <div class="bento-card animate-pulse">
    <div class="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-slate-50/30">
      <div class="h-8 w-16 bg-slate-100 rounded" />
      <div class="h-5 w-16 bg-slate-50 rounded" />
    </div>
    <div class="p-8 space-y-6">
      <div v-for="i in 3" :key="i" class="pl-16 space-y-2">
        <div class="h-3 w-10 bg-slate-100 rounded-full" />
        <div v-for="j in 2" :key="j" class="flex items-center gap-4 py-2">
          <div class="h-3 w-6 bg-slate-50 rounded" />
          <div class="h-4 bg-slate-50 rounded flex-1" />
        </div>
      </div>
    </div>
  </div>
</template>

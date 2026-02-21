<!-- src/components/skeleton/PostCardSkeleton.vue -->
<template>
  <div class="bento-card p-5 sm:p-6 md:p-8 flex flex-col md:flex-row gap-5 md:gap-8 animate-pulse">
    <!-- Date Column -->
    <div class="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start w-full md:w-20 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
      <div class="flex md:block items-baseline gap-2 text-center md:text-left">
        <div class="h-7 w-10 bg-slate-100 rounded" />
        <div class="h-2.5 w-8 bg-slate-100 rounded" />
        <div class="h-2.5 w-10 bg-slate-50 rounded" />
      </div>
    </div>
    <!-- Content -->
    <div class="flex-1 space-y-4">
      <div class="space-y-3">
        <div class="h-5 sm:h-6 bg-slate-100 rounded w-3/4" />
        <div class="h-4 bg-slate-50 rounded w-full" />
        <div class="h-4 bg-slate-50 rounded w-5/6" />
      </div>
      <div class="pt-4 md:pt-5 border-t border-gray-50 flex justify-between items-center">
        <div class="flex gap-4">
          <div class="h-3 w-12 bg-slate-50 rounded" />
          <div class="h-3 w-8 bg-slate-50 rounded" />
        </div>
        <div class="flex gap-1.5 md:gap-2">
          <div class="h-5 md:h-6 w-14 bg-slate-50 rounded-md" />
          <div class="h-5 md:h-6 w-14 bg-slate-50 rounded-md" />
        </div>
      </div>
    </div>
  </div>
</template>

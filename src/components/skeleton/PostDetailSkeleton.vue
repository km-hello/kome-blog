<!-- src/components/skeleton/PostDetailSkeleton.vue -->
<template>
  <div class="animate-pulse space-y-6">
    <!-- Meta header -->
    <div class="bento-card p-6 md:p-8 space-y-4">
      <div class="h-8 bg-slate-100 rounded w-3/4" />
      <div class="border-t border-slate-100 pt-4 mt-1 flex gap-5">
        <div class="h-3 w-20 bg-slate-50 rounded" />
        <div class="h-3 w-16 bg-slate-50 rounded" />
        <div class="h-3 w-14 bg-slate-50 rounded" />
      </div>
    </div>
    <!-- Body -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-9">
        <div class="bento-card p-8 md:p-10 space-y-4">
          <div class="h-5 bg-slate-100 rounded w-2/3" />
          <div class="h-4 bg-slate-50 rounded w-full" />
          <div class="h-4 bg-slate-50 rounded w-full" />
          <div class="h-4 bg-slate-50 rounded w-5/6" />
          <div class="h-4 bg-slate-50 rounded w-full mt-4" />
          <div class="h-4 bg-slate-50 rounded w-4/5" />
          <div class="h-4 bg-slate-50 rounded w-full" />
          <div class="h-4 bg-slate-50 rounded w-3/4" />
        </div>
      </div>
      <div class="lg:col-span-3 hidden lg:block">
        <div class="bento-card p-6 space-y-3">
          <div class="h-3 w-24 bg-slate-100 rounded" />
          <div class="h-3 w-full bg-slate-50 rounded" />
          <div class="h-3 w-4/5 bg-slate-50 rounded" />
          <div class="h-3 w-full bg-slate-50 rounded" />
          <div class="h-3 w-3/5 bg-slate-50 rounded" />
        </div>
      </div>
    </div>
  </div>
</template>

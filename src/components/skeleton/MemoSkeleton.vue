<!-- MemoSkeleton.vue - 动态卡片加载骨架屏 -->
<template>
  <!-- 动态卡片骨架（内容区 sm+ 左侧缩进 pl-11） -->
  <div class="bento-card p-5 animate-pulse">
    <div class="flex items-center gap-3 mb-3">
      <div class="size-8 rounded-full bg-slate-100" />
      <div class="flex items-center gap-2 flex-1">
        <div class="h-3.5 w-16 bg-slate-100 rounded" />
        <div class="h-3 w-12 bg-slate-50 rounded" />
      </div>
    </div>
    <div class="pl-0 sm:pl-11 space-y-2">
      <div class="h-4 bg-slate-50 rounded w-full" />
      <div class="h-4 bg-slate-50 rounded w-5/6" />
      <div class="h-4 bg-slate-50 rounded w-2/3" />
    </div>
  </div>
</template>

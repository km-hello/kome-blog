<!-- src/components/sidebar/LinkExchange.vue -->
<script setup lang="ts">
import { Send } from 'lucide-vue-next'
</script>

<template>
  <!-- Exchange Card -->
  <div class="bento-card px-5 py-6">
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Exchange</h4>
    </div>

    <div class="bg-slate-50 rounded-lg p-4 border border-slate-100">
      <p class="text-sm text-slate-700 leading-relaxed mb-4 font-medium">
        Welcome to exchange links. Please ensure your site is accessible.
      </p>
      <div class="space-y-2.5">
        <div class="flex items-center gap-2 text-xs text-slate-600 font-mono bg-white px-2 py-1.5 rounded border border-slate-100">
          <span class="size-1.5 bg-slate-300 rounded-full shrink-0"></span>
          <span class="opacity-50">Name:</span>
          <span class="font-bold text-slate-800">Kome Blog</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-600 font-mono bg-white px-2 py-1.5 rounded border border-slate-100">
          <span class="size-1.5 bg-slate-300 rounded-full shrink-0"></span>
          <span class="opacity-50">Desc:</span>
          <span class="font-bold text-slate-800 truncate">A collection of thoughts.</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-600 font-mono bg-white px-2 py-1.5 rounded border border-slate-100">
          <span class="size-1.5 bg-slate-300 rounded-full shrink-0"></span>
          <span class="opacity-50">Link:</span>
          <span class="font-bold text-slate-800 truncate">https://kome.blog</span>
        </div>
      </div>
    </div>

    <div class="mt-5">
      <a
          href="mailto:contact@kome.blog"
          class="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 py-2.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all"
      >
        <Send :size="12" /> Send Request
      </a>
    </div>
  </div>
</template>

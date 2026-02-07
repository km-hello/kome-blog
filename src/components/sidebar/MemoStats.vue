<!-- src/components/sidebar/MemoStats.vue -->
<script setup lang="ts">
import type { MemoStatsResponse } from '@/api/memo'

const props = defineProps<{
  stats: MemoStatsResponse
}>()

const formatWords = (count: number) => {
  if (count >= 10000) return `${(count / 1000).toFixed(1)}k`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return String(count)
}

const formatLatestDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="bento-card p-5">
    <h3 class="text-xs font-semibold text-slate-400 tracking-widest mb-4">MEMO STATS</h3>
    <div class="grid grid-cols-2 gap-2">
      <div class="text-center py-3 rounded-lg cursor-default group bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.totalCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">TOTAL</div>
      </div>
      <div class="text-center py-3 rounded-lg cursor-default group bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ formatWords(stats.totalWords) }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">WORDS</div>
      </div>
      <div class="text-center py-3 rounded-lg cursor-default group bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.thisMonthCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">THIS MONTH</div>
      </div>
      <div class="text-center py-3 rounded-lg cursor-default group bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ formatLatestDate(stats.latestDate) }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">LATEST</div>
      </div>
    </div>
  </div>
</template>

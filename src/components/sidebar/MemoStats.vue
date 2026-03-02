<!-- MemoStats.vue - 动态统计卡片 -->
<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import type {MemoStatsResponse} from '@/api/memo'

const {t, locale} = useI18n()

/**
 * Props 定义
 * @property stats 动态统计数据对象（MemoStatsResponse）
 */
defineProps<{
  stats: MemoStatsResponse
}>()

/**
 * 格式化字数（千位以上显示为 k 单位）
 */
const formatWords = (count: number) => {
  if (count >= 10000) return `${(count / 1000).toFixed(1)}k`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return String(count)
}

/**
 * 格式化最近发布日期，无数据时返回 "-"
 */
const formatLatestDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const localeStr = locale.value === 'zh-CN' ? 'zh-CN' : 'en-US'
  return date.toLocaleDateString(localeStr, {month: 'short', day: 'numeric'})
}
</script>

<template>
  <div class="bento-card p-5">
    <h3 class="text-xs font-semibold text-slate-400 tracking-widest mb-4">{{ t('sidebar.memoStats') }}</h3>
    <!-- 双列统计网格（Total / Words / This Month / Latest） -->
    <div class="grid grid-cols-2 gap-2">
      <div class="text-center py-3 rounded-lg cursor-default group bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.totalCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">{{ t('sidebar.total') }}</div>
      </div>
      <div class="text-center py-3 rounded-lg cursor-default group bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ formatWords(stats.totalWords) }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">{{ t('sidebar.words') }}</div>
      </div>
      <div class="text-center py-3 rounded-lg cursor-default group bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.thisMonthCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">{{ t('sidebar.thisMonth') }}</div>
      </div>
      <div class="text-center py-3 rounded-lg cursor-default group bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ formatLatestDate(stats.latestDate) }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">{{ t('sidebar.latest') }}</div>
      </div>
    </div>
  </div>
</template>

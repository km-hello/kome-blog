<!--
  SiteFooter.vue - 站点页脚组件

  功能：
    - 左侧显示版权信息（链接至 GitHub 仓库）
    - 右侧显示站点运行天数，基于 siteStore 中的站长注册时间动态计算
-->
<script setup lang="ts">
import { computed } from 'vue'
import { Timer } from 'lucide-vue-next'
import { useSiteStore } from '@/stores/useSiteStore'

const siteStore = useSiteStore()

/**
 * 站点运行天数（基于站长注册时间到当前日期的差值）
 */
const runningDays = computed(() => {
  const createdAt = siteStore.siteInfo?.owner?.createdAt
  if (!createdAt) return 0

  const startDate = new Date(createdAt)
  const now = new Date()
  return Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
})
</script>

<template>
  <!-- 页脚信息栏（两端对齐：左版权 / 右运行天数） -->
  <div class="bento-card px-5 py-4">
    <div class="flex flex-wrap items-center justify-between gap-y-1">
      <!-- 版权信息（链接至 GitHub 仓库） -->
      <a href="https://github.com/km-hello/kome-blog" target="_blank" class="text-[10px] font-semibold text-slate-400 tracking-widest hover:text-slate-700 transition-colors">
        © 2026 Kome Blog
      </a>
      <!-- 运行天数（Timer 图标 + 动态计算天数） -->
      <span class="text-[10px] font-semibold text-slate-400 tracking-widest flex items-center gap-1">
        <Timer :size="10" />
        Running {{ runningDays }} days
      </span>
    </div>
  </div>
</template>

<!-- SiteFooter.vue - 站点页脚 -->
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
  <!-- 页脚（flex-wrap 窄屏自动换行） -->
  <div class="bento-card px-5 py-4">
    <div class="flex flex-wrap items-center justify-between gap-y-1">
      <a href="https://github.com/km-hello/kome-blog" target="_blank" class="text-[10px] font-semibold text-slate-400 tracking-widest hover:text-slate-700 transition-colors">
        © 2026 Kome Blog
      </a>
      <span class="text-[10px] font-semibold text-slate-400 tracking-widest flex items-center gap-1">
        <Timer :size="10" />
        Running {{ runningDays }} days
      </span>
    </div>
  </div>
</template>

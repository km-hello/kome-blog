<!-- SiteFooter.vue - 站点页脚 -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { Timer, Languages } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useSiteStore } from '@/stores/useSiteStore'
import { setLocale } from '@/i18n'

const {t, locale} = useI18n()

const siteStore = useSiteStore()

const timerExpanded = ref(false)
const langExpanded = ref(false)
let langCollapseTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 切换中英文语言，移动端点击后短暂展示新语言标签再收起
 */
const handleLangClick = () => {
  const next = locale.value === 'en' ? 'zh-CN' : 'en'
  setLocale(next as 'en' | 'zh-CN')
  langExpanded.value = true
  if (langCollapseTimer) clearTimeout(langCollapseTimer)
  langCollapseTimer = setTimeout(() => { langExpanded.value = false }, 1500)
}

/**
 * 当前语言标签（展开时显示）
 */
const langLabel = computed(() => locale.value === 'en' ? 'EN' : '中文')

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
  <div class="bento-card px-5 py-3">
    <div class="flex items-center justify-between">

      <!-- 左：版权（始终显示文字） -->
      <a href="https://github.com/km-hello/kome-blog" target="_blank"
         class="text-[10px] font-semibold text-slate-400 tracking-widest hover:text-slate-600 transition-colors">
        © {{ new Date().getFullYear() }} {{ t('brand.blogName') }}
      </a>

      <!-- 右：运行天数 + 语言切换 -->
      <div class="flex items-center gap-2">

        <!-- 运行天数：桌面 hover 展开 / 移动 tap 切换 -->
        <span
            class="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer select-none"
            @mouseenter="timerExpanded = true"
            @mouseleave="timerExpanded = false"
            @click="timerExpanded = !timerExpanded"
        >
          <span
              class="overflow-hidden whitespace-nowrap text-[10px] font-semibold tracking-widest transition-all duration-300 ease-out"
              :class="timerExpanded ? 'max-w-30' : 'max-w-0'"
          >
            {{ t('sidebar.runningDays', { days: runningDays }) }}
          </span>
          <Timer :size="11" class="shrink-0" />
        </span>

        <span class="w-px h-3 bg-slate-200 rounded-full"></span>

        <!-- 语言切换：桌面 hover 展开 / 移动点击后短暂展示新语言再收起 -->
        <button
            class="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
            @mouseenter="langExpanded = true"
            @mouseleave="langExpanded = false"
            @click="handleLangClick"
        >
          <span
              class="overflow-hidden whitespace-nowrap text-[10px] font-semibold tracking-widest transition-all duration-300 ease-out"
              :class="langExpanded ? 'max-w-10' : 'max-w-0'"
          >
            {{ langLabel }}
          </span>
          <Languages :size="11" class="shrink-0" />
        </button>

      </div>
    </div>
  </div>
</template>

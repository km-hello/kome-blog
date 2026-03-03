<!-- SiteFooter.vue - 站点页脚 -->
<script setup lang="ts">
import { computed } from 'vue'
import { Timer, Languages } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useSiteStore } from '@/stores/useSiteStore'
import { setLocale } from '@/i18n'

const {t, locale} = useI18n()

const siteStore = useSiteStore()

/**
 * 切换中英文语言
 */
const toggleLanguage = () => {
  const next = locale.value === 'en' ? 'zh-CN' : 'en'
  setLocale(next as 'en' | 'zh-CN')
}

/**
 * 当前语言标签（hover 展开时显示当前语言名称）
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

      <!-- 右：运行天数 + 语言切换（图标，hover 展开文字） -->
      <div class="flex items-center gap-2">
        <span class="group flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors cursor-default">
          <span class="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 ease-out whitespace-nowrap text-[10px] font-semibold tracking-widest">
            {{ t('sidebar.runningDays', { days: runningDays }) }}
          </span>
          <Timer :size="11" class="shrink-0" />
        </span>
        <span class="w-px h-3 bg-slate-200 rounded-full"></span>
        <button class="group flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
                @click="toggleLanguage">
          <span class="max-w-0 overflow-hidden group-hover:max-w-[40px] transition-all duration-300 ease-out whitespace-nowrap text-[10px] font-semibold tracking-widest">
            {{ langLabel }}
          </span>
          <Languages :size="11" class="shrink-0" />
        </button>
      </div>

    </div>
  </div>
</template>

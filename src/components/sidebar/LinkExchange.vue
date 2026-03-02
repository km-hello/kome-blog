<!-- LinkExchange.vue - 友链交换信息卡片 -->
<script setup lang="ts">
import {ref, computed} from 'vue'
import {Copy, Check} from 'lucide-vue-next'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()

/**
 * 当前站点地址
 */
const origin = window.location.origin

/**
 * 友链交换信息字段列表（响应式，支持语言切换）
 */
const fields = computed(() => [
  {key: 'name', label: t('sidebar.exchangeName'), value: 'Kome Blog'},
  {key: 'link', label: t('sidebar.exchangeLink'), value: origin},
  {key: 'desc', label: t('sidebar.exchangeDesc'), value: 'A collection of thoughts.'},
  {key: 'avatar', label: t('sidebar.exchangeAvatar'), value: `${origin}/favicon.svg`},
])

/**
 * 全部复制按钮的反馈状态
 */
const copied = ref(false)

/**
 * 当前已复制的字段 key（用于逐项复制的视觉反馈）
 */
const copiedField = ref('')

/**
 * 一键复制所有友链信息到剪贴板。
 * 复制成功后显示 2 秒 Check 图标反馈。
 */
const copyAll = async () => {
  const text = fields.value.map(f => `${f.label}: ${f.value}`).join('\n')
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

/**
 * 复制单个字段值到剪贴板。
 * 复制成功后高亮对应行 1.5 秒。
 *
 * @param field 要复制的字段对象。
 */
const copyField = async (field: { key: string; label: string; value: string }) => {
  await navigator.clipboard.writeText(field.value)
  copiedField.value = field.key
  setTimeout(() => (copiedField.value = ''), 1500)
}
</script>

<template>
  <div class="bento-card p-5">
    <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">{{ t('sidebar.exchange') }}</h4>

    <!-- 字段列表（逐项点击复制） -->
    <div class="space-y-2">
      <div
          v-for="field in fields"
          :key="field.key"
          @click="copyField(field)"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer group"
      >
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-10 shrink-0">{{ field.label }}</span>
        <span class="text-xs text-slate-700 font-medium truncate flex-1">{{ field.value }}</span>
        <component
            :is="copiedField === field.key ? Check : Copy"
            :size="11"
            class="shrink-0 transition-colors"
            :class="copiedField === field.key ? 'text-emerald-500' : 'text-slate-300 group-hover:text-slate-500'"
        />
      </div>
    </div>

    <!-- 一键复制全部 -->
    <button
        @click="copyAll"
        class="mt-3 w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-300 text-slate-500 hover:text-slate-700 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wide transition-all cursor-pointer"
    >
      <component :is="copied ? Check : Copy" :size="11"/>
      {{ copied ? t('sidebar.copied') : t('sidebar.copyAll') }}
    </button>
  </div>
</template>

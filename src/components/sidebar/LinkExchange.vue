<!--
  LinkExchange.vue - 友链交换信息卡片

  功能：
    - 展示本站友链交换信息（名称、链接、描述、头像地址）
    - 点击单行可复制对应字段，点击底部按钮一键复制全部信息
    - 复制成功后图标切换为 Check 并延迟恢复，提供视觉反馈
    - 链接地址基于 window.location.origin 动态生成
-->
<script setup lang="ts">
import { ref } from 'vue'
import { Copy, Check } from 'lucide-vue-next'

const copied = ref(false)

const origin = window.location.origin

const fields = [
  { label: 'Name', value: 'Kome Blog' },
  { label: 'Link', value: origin },
  { label: 'Desc', value: 'A collection of thoughts.' },
  { label: 'Avatar', value: `${origin}/favicon.svg` },
]

/**
 * 一键复制所有友链信息到剪贴板。
 * 复制成功后显示 2 秒 Check 图标反馈。
 */
const copyAll = async () => {
  const text = fields.map(f => `${f.label}: ${f.value}`).join('\n')
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

/**
 * 当前已复制的字段标签（用于逐项复制的视觉反馈）
 */
const copiedField = ref('')

/**
 * 复制单个字段值到剪贴板。
 * 复制成功后高亮对应行 1.5 秒。
 *
 * @param field 要复制的字段对象。
 */
const copyField = async (field: typeof fields[number]) => {
  await navigator.clipboard.writeText(field.value)
  copiedField.value = field.label
  setTimeout(() => (copiedField.value = ''), 1500)
}
</script>

<template>
  <!-- 友链交换信息卡片 -->
  <div class="bento-card p-5">
    <!-- 标题 -->
    <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Exchange</h4>

    <!-- 字段列表（点击单行复制对应值） -->
    <div class="space-y-2">
      <!--
        每行显示：标签（Name/Link/Desc/Avatar） | 值（截断显示） | 复制图标
        复制成功时图标切换为绿色 Check
      -->
      <div
          v-for="field in fields"
          :key="field.label"
          @click="copyField(field)"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer group"
      >
        <!-- 字段标签 -->
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-10 shrink-0">{{ field.label }}</span>
        <!-- 字段值（超长文本 truncate） -->
        <span class="text-xs text-slate-700 font-medium truncate flex-1">{{ field.value }}</span>
        <!-- 复制状态图标：Copy → Check（复制成功后绿色反馈） -->
        <component
            :is="copiedField === field.label ? Check : Copy"
            :size="11"
            class="shrink-0 transition-colors"
            :class="copiedField === field.label ? 'text-emerald-500' : 'text-slate-300 group-hover:text-slate-500'"
        />
      </div>
    </div>

    <!-- 一键复制全部按钮（复制成功后文字切换为 "Copied!"） -->
    <button
        @click="copyAll"
        class="mt-3 w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-300 text-slate-500 hover:text-slate-700 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wide transition-all cursor-pointer"
    >
      <component :is="copied ? Check : Copy" :size="11" />
      {{ copied ? 'Copied!' : 'Copy All' }}
    </button>
  </div>
</template>

<!-- PageTitleCard.vue - 页面标题卡片 -->
<script setup lang="ts">
/**
 * Props 定义
 * @property title 页面主标题
 * @property subtitle 页面副标题描述
 * @property count 统计数字（不传则隐藏右侧区域）
 * @property countLabel 统计标签文字（如 "Total Posts"）
 */
defineProps<{
  title: string
  subtitle: string
  count?: number
  countLabel?: string
}>()
</script>

<template>
  <!-- 标题卡片（padding 响应式：p-5 → sm:p-6 → md:p-8） -->
  <div class="bento-card p-5 sm:p-6 md:p-8 flex items-center justify-between">
    <!-- 左侧标题 -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">{{ title }}</h1>
      <p class="text-sm text-slate-500 mt-2">{{ subtitle }}</p>
    </div>
    <!-- 右侧统计（text-3xl → sm:text-4xl） -->
    <div v-if="count != null" class="text-right shrink-0">
      <div class="text-3xl sm:text-4xl font-bold text-slate-900">{{ count }}</div>
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{{ countLabel }}</div>
    </div>
  </div>
</template>
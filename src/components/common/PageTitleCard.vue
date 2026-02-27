<!--
  PageTitleCard.vue - 页面标题卡片

  功能：通用页面顶部标题栏，左侧显示标题和副标题，右侧可选展示统计数字。
        用于 Archive、Memos、Links 等列表页的页首。

  Props:
    - title: 页面主标题
    - subtitle: 页面副标题描述
    - count: 统计数字（可选，不传则隐藏右侧区域）
    - countLabel: 统计标签文字（可选，如 "Total Posts"）
-->
<script setup lang="ts">
/**
 * Props 定义
 * @property title 页面标题
 * @property subtitle 页面副标题
 * @property count 统计数字（可选）
 * @property countLabel 统计标签（可选）
 */
defineProps<{
  title: string
  subtitle: string
  count?: number
  countLabel?: string
}>()
</script>

<template>
  <!-- 标题卡片（含统计数字） -->
  <div class="bento-card p-5 sm:p-6 md:p-8 flex items-center justify-between">
    <!-- 左侧文本内容 -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">{{ title }}</h1>
      <p class="text-sm text-slate-500 mt-2">{{ subtitle }}</p>
    </div>
    <!-- 右侧统计信息 -->
    <div v-if="count != null" class="text-right shrink-0">
      <div class="text-3xl sm:text-4xl font-bold text-slate-900">{{ count }}</div>
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{{ countLabel }}</div>
    </div>
  </div>
</template>
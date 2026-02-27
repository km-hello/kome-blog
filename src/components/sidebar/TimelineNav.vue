<!--
  TimelineNav.vue - 归档时间线导航组件

  功能：展示归档年份列表，点击可跳转到对应年份区块，当前年份高亮显示。

  Props:
    - archives: 归档数据（按年份分组）
    - activeYear: 当前高亮的年份

  Events:
    - scrollToYear(year): 点击年份时触发，滚动到对应年份区块
-->
<script setup lang="ts">
import type { PostArchiveResponse } from '@/api/post'

/**
 * Props 定义
 * @property archives 文章档案数据（按年份分组）
 * @property activeYear 当前活跃的年份
 */
defineProps<{
  archives: PostArchiveResponse[]
  activeYear: number | null
}>()

/**
 * 事件定义
 * @event scrollToYear 滚动到指定年份
 */
const emit = defineEmits<{
  scrollToYear: [year: number]
}>()
</script>

<template>
  <!-- 时间线导航卡片 -->
  <div class="bento-card p-5">
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Timeline</h4>
    </div>

    <!-- 时间线列表 -->
    <div v-if="archives.length > 0" class="relative pl-1">
      <div class="absolute left-4.25 top-2 bottom-2 w-px bg-slate-100"></div>
      <div class="flex flex-col gap-1">
        <a
            v-for="yearGroup in archives"
            :key="yearGroup.year"
            class="relative pl-4 flex justify-between items-center py-1.5 cursor-pointer text-sm font-medium transition-all border-l-2"
            :class="activeYear === yearGroup.year
            ? 'border-slate-900 text-slate-900 font-semibold pl-5'
            : 'border-transparent text-slate-400 hover:text-slate-600 hover:pl-5'"
            @click="emit('scrollToYear', yearGroup.year)"
        >
          <span>{{ yearGroup.year }}</span>
          <span class="text-[10px] font-mono bg-slate-50 text-slate-400 border border-slate-100 px-1.5 rounded">
            {{ yearGroup.total }}
          </span>
        </a>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-4 text-xs text-slate-400">
      No posts yet
    </div>
  </div>
</template>

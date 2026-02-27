<!--
  SearchBox.vue - 搜索框组件

  功能：
    - 回车触发搜索，输入框清空时自动重置搜索结果
    - 聚焦时显示快捷键提示标识（"/"）

  Props:
    - placeholder: 搜索框提示文本（可选，默认 "Search..."）

  Events:
    - search(keyword): 搜索关键词变化时触发（回车提交或清空自动重置）
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search } from 'lucide-vue-next'

/**
 * Props 定义
 * @property placeholder 搜索框提示文本
 */
defineProps<{
  placeholder?: string
}>()

/**
 * 事件定义
 * @event search 搜索关键词变化
 */
const emit = defineEmits<{
  search: [keyword: string]
}>()

const keyword = ref('')

/**
 * 提交搜索（去除首尾空格后触发 search 事件）
 */
const handleSearch = () => {
  emit('search', keyword.value.trim())
}

/**
 * 输入框清空时自动重置搜索
 */
watch(keyword, (val) => {
  if (val.trim() === '') {
    emit('search', '')
  }
})
</script>

<template>
  <!-- 搜索框卡片 -->
  <div class="bento-card px-5 py-4">
    <!--
      搜索输入容器
      - 默认灰底无边框，聚焦时切换为白底 + ring + 边框
      - 内部三元素横排：搜索图标 | 输入框 | 快捷键提示
    -->
    <div class="w-full bg-slate-50 rounded-md flex items-center px-3 py-2.5 transition-all group focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100 border border-transparent focus-within:border-slate-200">
      <!-- 搜索图标（聚焦时颜色加深） -->
      <Search :size="14" class="text-gray-400 mr-3 group-focus-within:text-slate-800 transition-colors" />
      <!-- 文本输入框（回车触发搜索） -->
      <input
          v-model="keyword"
          type="text"
          :placeholder="placeholder || 'Search...'"
          class="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder-gray-400"
          @keyup.enter="handleSearch"
      >
      <!-- 快捷键提示标识 "/"（仅聚焦时淡入显示） -->
      <span class="text-[10px] font-bold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200 shadow-sm transition-opacity opacity-0 group-focus-within:opacity-100">/</span>
    </div>
  </div>
</template>
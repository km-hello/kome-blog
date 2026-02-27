<!--
  Pagination.vue - 分页组件

  功能：
    - 显示页码按钮组，最多同时展示 5 个页码
    - 当前页码高亮，自动计算滑动窗口范围
    - 首尾页禁用对应的上一页/下一页按钮

  Props:
    - current: 当前页码
    - total: 数据总条数
    - pageSize: 每页显示数量

  Events:
    - change(page): 页码变化时触发，传递目标页码
-->
<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  current: number
  total: number
  pageSize: number
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

/**
 * 计算总页数
 */
const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

/**
 * 计算显示的页码列表（最多显示5页）
 */
const pageNumbers = computed(() => {
  const pages: number[] = []
  const maxShow = 5

  if (totalPages.value <= maxShow) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  } else {
    const half = Math.floor(maxShow / 2)
    let start = Math.max(1, props.current - half)
    let end = Math.min(totalPages.value, start + maxShow - 1)

    if (end - start < maxShow - 1) {
      start = Math.max(1, end - maxShow + 1)
    }

    for (let i = start; i <= end; i++) pages.push(i)
  }

  return pages
})

/**
 * 跳转到指定页码
 * @param page 目标页码
 */
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== props.current) {
    emit('change', page)
  }
}
</script>

<template>
  <!--
    分页按钮组
    - 仅在总页数 > 1 时渲染
    - 按钮尺寸响应式：移动端 size-10（易于点按）/ sm+ size-9（紧凑）
    - 交互样式：hover 反色（白底→深底），disabled 半透明+禁止光标
  -->
  <div v-if="totalPages > 1" class="flex justify-center items-center gap-2.5 sm:gap-2 py-6">
    <!-- 上一页按钮（第一页时禁用） -->
    <button
        class="size-10 sm:size-9 rounded-md flex items-center justify-center bg-white border border-black/4 text-slate-600 font-medium text-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-black/4"
        :disabled="current === 1"
        @click="goToPage(current - 1)"
    >
      <ChevronLeft :size="14" />
    </button>

    <!-- 页码按钮（滑动窗口，最多显示 5 个；当前页深色高亮） -->
    <button
        v-for="page in pageNumbers"
        :key="page"
        class="size-10 sm:size-9 rounded-md flex items-center justify-center bg-white border border-black/4 text-slate-600 font-medium text-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900"
        :class="{ 'bg-slate-900! text-white! border-slate-900!': current === page }"
        @click="goToPage(page)"
    >
      {{ page }}
    </button>

    <!-- 下一页按钮（最后一页时禁用） -->
    <button
        class="size-10 sm:size-9 rounded-md flex items-center justify-center bg-white border border-black/4 text-slate-600 font-medium text-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-black/4"
        :disabled="current === totalPages"
        @click="goToPage(current + 1)"
    >
      <ChevronRight :size="14" />
    </button>
  </div>
</template>
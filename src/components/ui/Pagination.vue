<!-- src/components/ui/Pagination.vue -->
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

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

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

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== props.current) {
    emit('change', page)
  }
}
</script>

<template>
  <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 py-6">
    <button
        class="size-9 rounded-md flex items-center justify-center bg-white border border-black/5 text-slate-600 font-medium text-sm shadow-sm transition-colors hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-black/5"
        :disabled="current === 1"
        @click="goToPage(current - 1)"
    >
      <ChevronLeft :size="14" />
    </button>

    <button
        v-for="page in pageNumbers"
        :key="page"
        class="size-9 rounded-md flex items-center justify-center bg-white border border-black/5 text-slate-600 font-medium text-sm shadow-sm transition-colors hover:bg-slate-900 hover:text-white hover:border-slate-900"
        :class="{ '!bg-slate-900 !text-white !border-slate-900': current === page }"
        @click="goToPage(page)"
    >
      {{ page }}
    </button>

    <button
        class="size-9 rounded-md flex items-center justify-center bg-white border border-black/5 text-slate-600 font-medium text-sm shadow-sm transition-colors hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-black/5"
        :disabled="current === totalPages"
        @click="goToPage(current + 1)"
    >
      <ChevronRight :size="14" />
    </button>
  </div>
</template>
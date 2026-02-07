<!-- src/components/sidebar/SiteFooter.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LoaderCircle } from 'lucide-vue-next'

const runningDays = ref(0)

onMounted(() => {
  const startDate = new Date('2025-01-01')
  const now = new Date()
  runningDays.value = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
})
</script>

<template>
  <div class="text-center py-2 flex flex-col gap-1">
    <span class="text-[10px] text-gray-400">© 2025 Kome Blog</span>
    <span class="text-[10px] text-gray-300 font-mono flex items-center justify-center gap-1">
      <LoaderCircle :size="8" class="animate-spin" />
      Running for {{ runningDays }} days
    </span>
  </div>
</template>

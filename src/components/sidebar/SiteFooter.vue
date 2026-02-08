<!-- src/components/sidebar/SiteFooter.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Timer } from 'lucide-vue-next'

const runningDays = ref(0)

onMounted(() => {
  const startDate = new Date('2025-01-01')
  const now = new Date()
  runningDays.value = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
})
</script>

<template>
  <div class="bento-card px-5 py-4">
    <div class="flex items-center justify-between">
      <a href="https://github.com/kome-blog" target="_blank" class="text-[10px] font-semibold text-slate-400 tracking-widest hover:text-slate-600 transition-colors">
        © 2026 Kome Blog
      </a>
      <span class="text-[10px] font-semibold text-slate-400 tracking-widest flex items-center gap-1">
        <Timer :size="10" />
        Running {{ runningDays }} days
      </span>
    </div>
  </div>
</template>

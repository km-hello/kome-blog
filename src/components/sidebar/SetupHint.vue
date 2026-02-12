<!-- src/components/sidebar/SetupHint.vue -->
<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
</script>

<template>
  <div class="bento-card p-6">
    <div class="flex flex-col items-center text-center py-4">
      <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Settings class="w-6 h-6 text-slate-400" />
      </div>
      <h3 class="font-bold text-slate-700 mb-2">System Not Initialized</h3>
      <p class="text-sm text-slate-500 leading-relaxed">
        Please visit the admin panel to complete the initial setup.
      </p>
    </div>
  </div>
</template>

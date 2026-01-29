<!-- src/components/sidebar/SearchBox.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'

defineProps<{
  placeholder?: string
}>()

const emit = defineEmits<{
  search: [keyword: string]
}>()

const keyword = ref('')

const handleSearch = () => {
  if (keyword.value.trim()) {
    emit('search', keyword.value.trim())
  }
}
</script>

<template>
  <div class="bg-white rounded-xl border border-black/5 shadow-sm px-5 py-4">
    <div class="w-full bg-slate-50 rounded-md flex items-center px-3 py-2.5 transition-all group focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100 border border-transparent focus-within:border-slate-200">
      <Search :size="14" class="text-gray-400 mr-3 group-focus-within:text-slate-800 transition-colors" />
      <input
          v-model="keyword"
          type="text"
          :placeholder="placeholder || 'Search...'"
          class="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder-gray-400"
          @keyup.enter="handleSearch"
      >
      <span class="text-[10px] font-bold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200 shadow-sm transition-opacity opacity-0 group-focus-within:opacity-100">/</span>
    </div>
  </div>
</template>
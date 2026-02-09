<!-- src/components/sidebar/LinkExchange.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { Copy, Check } from 'lucide-vue-next'

const copied = ref(false)

const fields = [
  { label: 'Name', value: 'Kome Blog' },
  { label: 'Desc', value: 'A collection of thoughts.' },
  { label: 'Link', value: 'https://kome.blog' },
  { label: 'Avatar', value: 'https://api.dicebear.com/7.x/shapes/svg?seed=Kome' },
]

const copyAll = async () => {
  const text = fields.map(f => `${f.label}: ${f.value}`).join('\n')
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

const copiedField = ref('')

const copyField = async (field: typeof fields[number]) => {
  await navigator.clipboard.writeText(field.value)
  copiedField.value = field.label
  setTimeout(() => (copiedField.value = ''), 1500)
}
</script>

<template>
  <div class="bento-card px-5 py-5">
    <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Exchange</h4>

    <div class="space-y-2">
      <div
          v-for="field in fields"
          :key="field.label"
          @click="copyField(field)"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer group"
      >
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-10 shrink-0">{{ field.label }}</span>
        <span class="text-xs text-slate-700 font-medium truncate flex-1">{{ field.value }}</span>
        <component
            :is="copiedField === field.label ? Check : Copy"
            :size="11"
            class="shrink-0 transition-colors"
            :class="copiedField === field.label ? 'text-emerald-500' : 'text-slate-300 group-hover:text-slate-500'"
        />
      </div>
    </div>

    <button
        @click="copyAll"
        class="mt-3 w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-300 text-slate-500 hover:text-slate-700 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wide transition-all cursor-pointer"
    >
      <component :is="copied ? Check : Copy" :size="11" />
      {{ copied ? 'Copied!' : 'Copy All' }}
    </button>
  </div>
</template>

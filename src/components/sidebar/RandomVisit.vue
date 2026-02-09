<!-- src/components/sidebar/RandomVisit.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { Dice5, ExternalLink } from 'lucide-vue-next'
import type { LinkResponse } from '@/api/link'

const props = defineProps<{
  links: LinkResponse[]
}>()

const picked = ref<LinkResponse | null>(null)

const roll = () => {
  if (props.links.length === 0) return
  const idx = Math.floor(Math.random() * props.links.length)
  picked.value = props.links[idx]
}
</script>

<template>
  <div class="bento-card px-5 py-5">
    <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Random Visit</h4>

    <p class="text-[11px] text-slate-400 leading-relaxed mb-4">
      Roll the dice and visit a random friend.
    </p>

    <!-- Picked preview -->
    <a v-if="picked" :href="picked.url" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 rounded-lg bg-slate-50/70 border border-slate-100/80 hover:bg-slate-100/80 px-3 py-2.5 mb-4 group transition-colors">
      <div class="size-8 rounded-full bg-linear-to-br from-slate-100 to-slate-50 p-0.5 border border-slate-100 overflow-hidden shrink-0">
        <img
            :src="picked.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${picked.name}`"
            :alt="picked.name"
            class="size-full rounded-full bg-white object-cover"
        >
      </div>
      <div class="flex-1 min-w-0">
        <span class="text-xs font-bold text-slate-600 truncate block group-hover:text-blue-600 transition-colors">{{ picked.name }}</span>
        <span class="text-[11px] text-slate-400 truncate block">{{ picked.description }}</span>
      </div>
      <ExternalLink :size="12" class="text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" />
    </a>

    <button
        @click="roll"
        :disabled="links.length === 0"
        class="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-md text-[11px] font-semibold uppercase tracking-wide transition-all cursor-pointer"
    >
      <Dice5 :size="12" />
      I'm Feeling Lucky
    </button>
  </div>
</template>

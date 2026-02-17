<!-- src/components/sidebar/RepoCard.vue -->
<script setup lang="ts">
import { ExternalLink } from 'lucide-vue-next'
import { IconGithub } from '@/components/icons/BrandIcons'

const repos = [
  { label: 'Blog', name: 'kome-blog', url: 'https://github.com/km-hello/kome-blog' },
  { label: 'Admin', name: 'kome-admin', url: 'https://github.com/km-hello/kome-admin' },
  { label: 'API', name: 'kome-api', url: 'https://github.com/km-hello/kome-api' },
]
</script>

<template>
  <div class="bento-card px-5 py-5">
    <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Source Code</h4>

    <div class="space-y-2">
      <a
          v-for="r in repos"
          :key="r.label"
          :href="r.url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors group"
      >
        <IconGithub class="size-4 text-slate-400 shrink-0" />
        <div class="min-w-0 flex-1">
          <span class="text-xs font-medium text-slate-700">{{ r.label }}</span>
          <span class="text-[10px] text-slate-400 ml-1.5">{{ r.name }}</span>
        </div>
        <ExternalLink :size="11" class="shrink-0 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </a>
    </div>
  </div>
</template>

<!-- src/components/layout/AppHeader.vue -->
<script setup lang="ts">
import { Menu } from 'lucide-vue-next'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Archive', path: '/archive' },
  { label: 'Memos', path: '/memos' },
  { label: 'Links', path: '/links' },
  { label: 'About', path: '/about' },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <header class="bg-white/85 backdrop-blur-xl border-b border-black/5 sticky top-0 z-50 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
      <router-link to="/" class="flex items-center gap-3">
        <div class="size-9 bg-slate-900 rounded-md flex items-center justify-center text-white text-lg font-bold shadow-md">
          K
        </div>
        <h1 class="font-bold text-slate-900 text-base">Kome Blog</h1>
      </router-link>

      <nav class="hidden md:flex gap-6 text-sm font-medium text-slate-500">
        <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="px-3 py-2 rounded-md transition-colors hover:text-slate-900 hover:bg-slate-100"
            :class="{ 'text-slate-900 bg-slate-100 font-semibold': isActive(item.path) }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <button class="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
        <Menu :size="20" />
      </button>
    </div>
  </header>
</template>
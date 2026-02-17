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

const externalLinks: { label: string; href: string }[] = []

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <header class="bg-white/90 backdrop-blur-2xl saturate-150 sticky top-0 z-50" style="border-bottom: 1px solid rgba(0, 0, 0, 0.06); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02)">
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
            :class="{ 'text-slate-900 bg-slate-50 font-semibold': isActive(item.path) }"
        >
          {{ item.label }}
        </router-link>
        <a
            v-for="link in externalLinks"
            :key="link.href"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-2 rounded-md transition-colors hover:text-slate-900 hover:bg-slate-100"
        >
          {{ link.label }}
        </a>
      </nav>

      <button class="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
        <Menu :size="20" />
      </button>
    </div>
  </header>
</template>
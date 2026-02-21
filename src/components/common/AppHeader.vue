<!-- src/components/layout/AppHeader.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)

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

// Auto-close mobile menu on route change
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
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

      <button
          class="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <Menu v-if="!mobileMenuOpen" :size="20" />
        <X v-else :size="20" />
      </button>
    </div>

    <!-- Mobile dropdown menu -->
    <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
    >
      <nav v-show="mobileMenuOpen" class="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl">
        <div class="max-w-6xl mx-auto px-4 py-2 flex flex-col">
          <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="px-4 py-3 rounded-md text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 hover:bg-slate-50"
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
              class="px-4 py-3 rounded-md text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 hover:bg-slate-50"
          >
            {{ link.label }}
          </a>
        </div>
      </nav>
    </Transition>
  </header>
</template>

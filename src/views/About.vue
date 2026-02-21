<!-- src/views/About.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import ProfileCard from '@/components/sidebar/ProfileCard.vue'
import ProfileCardSkeleton from '@/components/skeleton/ProfileCardSkeleton.vue'
import SetupHint from '@/components/sidebar/SetupHint.vue'
import SiteFooter from '@/components/sidebar/SiteFooter.vue'
import SkillCard from '@/components/sidebar/SkillCard.vue'
import SkillCardSkeleton from '@/components/skeleton/SkillCardSkeleton.vue'
import RepoCard from '@/components/sidebar/RepoCard.vue'
import PageTitleCard from '@/components/common/PageTitleCard.vue'
import { useSiteStore } from '@/stores/useSiteStore'
import { useSidebarDrawer } from '@/composables/useSidebarDrawer'

const siteStore = useSiteStore()
const { isLg } = useSidebarDrawer()

const features = [
  { title: 'Articles', desc: 'Marked-based rendering with highlight.js, KaTeX math, Mermaid diagrams, pinned posts, reading time, and auto TOC.' },
  { title: 'Memos', desc: 'Microblog feed with intersection-observer infinite scroll, pinned entries, usage stats, and relative timestamps.' },
  { title: 'Friend Links', desc: 'Blogroll directory with real-time keyword filtering, random-visit shuffle, and one-click-copy exchange card.' },
  { title: 'Archive', desc: 'Chronological timeline grouped by year/month with scrollIntoView navigation and tag-based filtering.' },
  { title: 'Search & Filter', desc: 'Global keyword search and multi-tag filtering across all content types via query-parameter routing.' },
  { title: 'Admin Dashboard', desc: 'Full CRUD for posts, memos, tags, links, and site settings behind JWT authentication.' },
]

const techStacks = [
  {
    label: 'Blog',
    items: ['Vue 3', 'TypeScript', 'Vite', 'Tailwind CSS v4', 'Vue Router', 'Pinia', 'Axios', 'Lucide Icons', 'VueUse', 'vue-sonner', 'Marked', 'highlight.js', 'KaTeX', 'Mermaid'],
  },
  {
    label: 'Admin',
    items: ['Vue 3', 'TypeScript', 'Vite', 'Tailwind CSS v4', 'Vue Router', 'Pinia', 'Axios', 'Lucide Icons', 'VueUse', 'vue-sonner', 'shadcn-vue', 'TanStack Table'],
  },
  {
    label: 'API',
    items: ['Spring Boot 3', 'Java 21', 'MyBatis-Plus', 'MySQL', 'Spring Security', 'JWT (JJWT)', 'Flyway', 'Springdoc OpenAPI', 'Lombok', 'Spring Actuator'],
  },
]

onMounted(() => {
  siteStore.fetchSiteInfo()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main -->
      <main class="lg:col-span-8 flex flex-col gap-6">
        <PageTitleCard
            title="About"
            subtitle="About this blog and the person behind it."
        />

        <!-- Project -->
        <div class="bento-card p-6">
          <h2 class="text-sm font-bold text-slate-900 mb-2">Project</h2>
          <p class="text-sm text-slate-500 leading-relaxed mb-5">
            Kome Blog is a modern, full-stack personal blog system composed of three parts: a public-facing blog, an admin dashboard, and a RESTful API backend.
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
                v-for="feature in features"
                :key="feature.title"
                class="p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <h3 class="text-sm font-semibold text-slate-800">{{ feature.title }}</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">{{ feature.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Tech Stack -->
        <div class="bento-card p-6">
          <h2 class="text-sm font-bold text-slate-900 mb-5">Tech Stack</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div v-for="stack in techStacks" :key="stack.label">
              <h3 class="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">{{ stack.label }}</h3>
              <div class="flex flex-wrap gap-2">
                <span
                    v-for="item in stack.items"
                    :key="item"
                    class="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 rounded-md"
                >
                  {{ item }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Sidebar -->
      <aside class="lg:col-span-4 relative">
        <Teleport to="#sidebar-drawer-content" :disabled="isLg">
          <div class="sticky top-24 space-y-5">
            <ProfileCard v-if="siteStore.siteInfo" :owner="siteStore.siteInfo.owner" :stats="siteStore.siteInfo.stats" />
            <SetupHint v-else-if="siteStore.initialized === false" />
            <ProfileCardSkeleton v-else />

            <SkillCard v-if="siteStore.siteInfo" :skills="siteStore.siteInfo?.owner?.skills" />
            <SkillCardSkeleton v-else />

            <RepoCard />

            <SiteFooter />
          </div>
        </Teleport>
      </aside>
    </div>
  </div>
</template>

<!-- src/views/Links.vue -->
<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {Globe} from 'lucide-vue-next'
import AppHeader from '@/components/common/AppHeader.vue'
import ProfileCard from '@/components/sidebar/ProfileCard.vue'
import SetupHint from '@/components/sidebar/SetupHint.vue'
import SearchBox from '@/components/sidebar/SearchBox.vue'
import LinkExchange from '@/components/sidebar/LinkExchange.vue'
import RandomVisit from '@/components/sidebar/RandomVisit.vue'
import SiteFooter from '@/components/sidebar/SiteFooter.vue'
import PageTitleCard from '@/components/common/PageTitleCard.vue'

import {getLinksApi, type LinkResponse} from '@/api/link'
import { useSiteStore } from '@/stores/useSiteStore'

const siteStore = useSiteStore()

const links = ref<LinkResponse[]>([])
const searchKeyword = ref('')
const loading = ref(true)

const fetchLinks = async () => {
  loading.value = true
  links.value = await getLinksApi({
    pageNum: 1,
    pageSize: 100,
    keyword: searchKeyword.value || undefined,
  })
  loading.value = false
}

const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
  fetchLinks()
}

const extractDomain = (url: string) => {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

onMounted(async () => {
  await Promise.all([
    fetchLinks(),
    siteStore.fetchSiteInfo(),
  ])
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main -->
      <main class="lg:col-span-8 flex flex-col gap-6">
        <PageTitleCard
            title="Links"
            subtitle="Connecting with the digital neighborhood."
            :count="links.length"
            count-label="Total Links"
        />

        <!-- Links Grid -->
        <div v-if="links.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <a
              v-for="link in links"
              :key="link.id"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="bento-card p-5 h-full flex flex-col items-center text-center group cursor-pointer"
          >
            <div class="size-16 rounded-full bg-linear-to-br from-slate-100 to-slate-50 p-0.5 border border-slate-100 shrink-0 overflow-hidden mb-3 group-hover:scale-105 transition-transform">
              <img
                  :src="link.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${link.name}`"
                  :alt="link.name"
                  class="size-full rounded-full bg-white object-cover"
              >
            </div>
            <h3 class="text-sm font-bold text-slate-900 truncate w-full group-hover:text-blue-600 transition-colors">
              {{ link.name }}
            </h3>
            <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1 min-h-10">
              {{ link.description }}
            </p>
            <div class="mt-3 pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Globe :size="12" />
              <span class="truncate max-w-[80%]">{{ extractDomain(link.url) }}</span>
            </div>
          </a>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading" class="text-center py-16 text-sm text-slate-400">
          {{ searchKeyword ? 'No matching links.' : 'No links yet.' }}
        </div>
      </main>

      <!-- Sidebar -->
      <aside class="lg:col-span-4 relative hidden lg:block">
        <div class="sticky top-24 space-y-5">
          <ProfileCard v-if="siteStore.siteInfo" :owner="siteStore.siteInfo.owner" :stats="siteStore.siteInfo.stats" />
          <SetupHint v-else-if="siteStore.initialized === false" />

          <SearchBox placeholder="Search links..." @search="handleSearch" />

          <LinkExchange />

          <RandomVisit :links="links" />

          <SiteFooter />
        </div>
      </aside>
    </div>
  </div>
</template>
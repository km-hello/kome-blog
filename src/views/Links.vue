<!-- src/views/Links.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ProfileCard from '@/components/sidebar/ProfileCard.vue'
import SearchBox from '@/components/sidebar/SearchBox.vue'
import LinkExchange from '@/components/sidebar/LinkExchange.vue'
import PageTitleCard from '@/components/common/PageTitleCard.vue'

import { getLinksApi, type LinkResponse } from '@/api/link'
import { getSiteInfoApi, type SiteInfoResponse } from '@/api/site'

const links = ref<LinkResponse[]>([])
const siteInfo = ref<SiteInfoResponse | null>(null)
const searchKeyword = ref('')

const fetchLinks = async () => {
  const res = await getLinksApi({
    pageNum: 1,
    pageSize: 100,
    keyword: searchKeyword.value || undefined,
  })
  links.value = res
}

const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
  fetchLinks()
}

onMounted(async () => {
  await Promise.all([
    fetchLinks(),
    getSiteInfoApi().then(res => siteInfo.value = res),
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
              v-for="link in links"
              :key="link.id"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="bento-card p-4 flex items-center gap-4 group cursor-pointer"
          >
            <div class="size-12 rounded-full bg-slate-100 p-0.5 border border-slate-100 shrink-0 overflow-hidden">
              <img
                  :src="link.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${link.name}`"
                  :alt="link.name"
                  class="size-full rounded-full bg-white object-cover"
              >
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-bold text-slate-900 truncate pr-2 group-hover:text-blue-600 transition-colors">
                {{ link.name }}
              </h3>
              <p class="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                {{ link.description }}
              </p>
            </div>
          </a>
        </div>
      </main>

      <!-- Sidebar -->
      <aside class="lg:col-span-4 relative hidden lg:block">
        <div class="sticky top-24 space-y-5">
          <ProfileCard v-if="siteInfo" :owner="siteInfo.owner" :stats="siteInfo.stats" />

          <SearchBox placeholder="Search links..." @search="handleSearch" />

          <LinkExchange />
        </div>
      </aside>
    </div>
  </div>
</template>
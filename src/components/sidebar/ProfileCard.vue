<!-- src/components/sidebar/ProfileCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Globe, Mail, Rss, Home, Link as LinkIcon } from 'lucide-vue-next'
import { IconGithub, IconX } from '@/components/icons/BrandIcons'
import type { OwnerInfo, SiteStats } from '@/api/site'

const props = defineProps<{
  owner: OwnerInfo
  stats: SiteStats
}>()

// platform 到图标的映射
const iconMap: Record<string, any> = {
  github: IconGithub,
  twitter: IconX,
  email: Mail,
  homepage: Home,
  website: Globe,
  rss: Rss,
}

// 获取平台图标
const getIcon = (platform: string) => iconMap[platform] || LinkIcon

// 过滤掉 url 为空的链接（保留 # 以显示图标）
const validLinks = computed(() =>
    props.owner.socialLinks?.filter(link => link.url) || []
)

// 判断链接是否可点击
const isClickable = (url: string) => url && url !== '#'

// 获取链接的 href（处理 email 类型）
const getLinkHref = (link: { platform: string; url: string }) => {
  if (!isClickable(link.url)) return undefined
  if (link.platform === 'email') {
    return link.url.startsWith('mailto:') ? link.url : `mailto:${link.url}`
  }
  return link.url
}
</script>

<template>
  <div class="bento-card p-6">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <div class="size-14 rounded-full p-1 bg-white border border-gray-100 shadow-sm overflow-hidden shrink-0">
        <img
            :src="owner.avatar"
            :alt="owner.nickname"
            class="size-full bg-slate-50 rounded-full"
        >
      </div>
      <div>
        <h3 class="font-bold text-slate-900 text-lg">{{ owner.nickname }}</h3>
        <p v-if="owner.description" class="text-xs text-slate-500">{{ owner.description }}</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-2">
      <div class="text-center py-2 rounded-lg cursor-default group border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.publishedPostCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">POSTS</div>
      </div>
      <div class="text-center py-2 rounded-lg cursor-default group border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.usedTagCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">TAGS</div>
      </div>
      <div class="text-center py-2 rounded-lg cursor-default group border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.publishedMemoCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">MEMOS</div>
      </div>
      <div class="text-center py-2 rounded-lg cursor-default group border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors">
        <div class="text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.publishedLinkCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">LINKS</div>
      </div>
    </div>

    <div class="border-t border-gray-100 mt-3 mb-5 mx-1"></div>

    <!-- Social Links (仅在有链接配置时显示) -->
    <div v-if="validLinks.length > 0" class="grid grid-cols-4 gap-2">
      <component
          v-for="link in validLinks"
          :key="link.platform"
          :is="isClickable(link.url) ? 'a' : 'span'"
          :href="getLinkHref(link)"
          :target="isClickable(link.url) && link.platform !== 'email' ? '_blank' : undefined"
          :rel="isClickable(link.url) ? 'noopener noreferrer' : undefined"
          class="flex items-center justify-center h-10 rounded-lg border transition-colors"
          :class="isClickable(link.url)
            ? 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900 cursor-pointer'
            : 'bg-slate-50 border-slate-100 text-slate-300 cursor-default'"
          :title="isClickable(link.url) ? link.url : undefined"
      >
        <component :is="getIcon(link.platform)" :size="18" />
      </component>
    </div>
  </div>
</template>
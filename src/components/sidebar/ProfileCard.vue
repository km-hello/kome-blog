<!-- ProfileCard.vue - 个人资料卡片 -->
<script setup lang="ts">
import { computed } from 'vue'
import { Globe, Mail, Home, Link as LinkIcon } from 'lucide-vue-next'
import { IconGithub, IconX, IconTelegram } from '@/components/icons/BrandIcons'
import { useI18n } from 'vue-i18n'
import type { OwnerInfo, SiteStats } from '@/api/site'
import { DEFAULT_AVATAR } from '@/constants'

const {t} = useI18n()

/**
 * Props 定义
 * @property owner 站长信息（OwnerInfo，含头像、昵称、描述、社交链接）
 * @property stats 站点统计数据（SiteStats，含各类内容发布数量）
 */
const props = defineProps<{
  owner: OwnerInfo
  stats: SiteStats
}>()

/**
 * 平台到图标的映射关系
 */
const iconMap: Record<string, any> = {
  github: IconGithub,
  twitter: IconX,
  email: Mail,
  homepage: Home,
  website: Globe,
  telegram: IconTelegram,
}

/**
 * 根据平台名称获取对应的图标组件
 * @param platform 平台标识
 */
const getIcon = (platform: string) => iconMap[platform] || LinkIcon

/**
 * 过滤有效的社交链接（url 不为空）
 */
const validLinks = computed(() =>
    props.owner.socialLinks?.filter(link => link.url) ?? []
)

/**
 * 判断链接是否可点击
 * @param url 链接 URL
 */
const isClickable = (url: string) => url && url !== '#'

/**
 * 获取链接的 href（处理邮箱类型）
 * @param link 社交链接对象
 */
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
    <!-- 头像 + 昵称/描述 -->
    <div class="flex items-center gap-4 mb-6">
      <div class="size-14 rounded-full overflow-hidden shrink-0 ring-2 ring-slate-100">
        <img
            :src="owner.avatar || DEFAULT_AVATAR"
            :alt="owner.nickname"
            class="size-full bg-slate-50 object-cover"
        >
      </div>
      <div class="min-w-0">
        <h3 class="font-bold text-slate-800 text-base">{{ owner.nickname }}</h3>
        <p v-if="owner.description" class="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{{ owner.description }}</p>
      </div>
    </div>

    <!-- 四宫格统计（sm+ gap 加大，数字 text-base → sm:text-lg） -->
    <div class="grid grid-cols-4 gap-1.5 sm:gap-2">
      <div class="text-center py-2 rounded-lg cursor-default group border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors">
        <div class="text-base sm:text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.publishedPostCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">{{ t('sidebar.posts') }}</div>
      </div>
      <div class="text-center py-2 rounded-lg cursor-default group border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors">
        <div class="text-base sm:text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.usedTagCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">{{ t('sidebar.tags') }}</div>
      </div>
      <div class="text-center py-2 rounded-lg cursor-default group border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors">
        <div class="text-base sm:text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.publishedMemoCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">{{ t('sidebar.memos') }}</div>
      </div>
      <div class="text-center py-2 rounded-lg cursor-default group border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors">
        <div class="text-base sm:text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.publishedLinkCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">{{ t('sidebar.links') }}</div>
      </div>
    </div>

    <template v-if="validLinks.length > 0">
      <div class="border-t border-gray-100 mt-3 mb-5 mx-1"></div>

      <!-- 社交链接图标组（四列网格，sm+ gap 加大；动态组件区分可点击 <a> / 禁用 <span>） -->
      <div class="grid grid-cols-4 gap-1.5 sm:gap-2">
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
    </template>
  </div>
</template>
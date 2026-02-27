<!--
  ProfileCard.vue - 个人资料卡片

  功能：
    - 展示站长头像、昵称、个人描述
    - 四宫格统计信息（文章数、标签数、动态数、友链数）
    - 社交链接图标组：自动识别平台（GitHub、Twitter、Email 等）并匹配图标
    - 邮箱链接自动补全 mailto: 前缀

  Props:
    - owner: 站长信息（OwnerInfo，含头像、昵称、描述、社交链接）
    - stats: 站点统计数据（SiteStats，含各类内容发布数量）
-->
<script setup lang="ts">
import { computed } from 'vue'
import { Globe, Mail, Rss, Home, Link as LinkIcon } from 'lucide-vue-next'
import { IconGithub, IconX } from '@/components/icons/BrandIcons'
import type { OwnerInfo, SiteStats } from '@/api/site'

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
  rss: Rss,
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
    props.owner.socialLinks?.filter(link => link.url) || []
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
  <!-- 个人资料卡片 -->
  <div class="bento-card p-6">
    <!-- 头部区域：头像 + 昵称/描述 -->
    <div class="flex items-center gap-4 mb-6">
      <!-- 圆形头像（ring 装饰边框） -->
      <div class="size-14 rounded-full overflow-hidden shrink-0 ring-2 ring-slate-100">
        <img
            :src="owner.avatar"
            :alt="owner.nickname"
            class="size-full bg-slate-50 object-cover"
        >
      </div>
      <div class="min-w-0">
        <h3 class="font-bold text-slate-800 text-base">{{ owner.nickname }}</h3>
        <p v-if="owner.description" class="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{{ owner.description }}</p>
      </div>
    </div>

    <!-- 四宫格统计信息（文章/标签/动态/友链），hover 时背景高亮 -->
    <div class="grid grid-cols-4 gap-1.5 sm:gap-2">
      <div class="text-center py-2 rounded-lg cursor-default group border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors">
        <div class="text-base sm:text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.publishedPostCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">POSTS</div>
      </div>
      <div class="text-center py-2 rounded-lg cursor-default group border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors">
        <div class="text-base sm:text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.usedTagCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">TAGS</div>
      </div>
      <div class="text-center py-2 rounded-lg cursor-default group border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors">
        <div class="text-base sm:text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.publishedMemoCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">MEMOS</div>
      </div>
      <div class="text-center py-2 rounded-lg cursor-default group border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors">
        <div class="text-base sm:text-lg font-bold text-slate-600 tabular-nums group-hover:text-slate-900 leading-tight">
          {{ stats.publishedLinkCount }}
        </div>
        <div class="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 tracking-widest mt-1">LINKS</div>
      </div>
    </div>

    <!-- 分割线 -->
    <div class="border-t border-gray-100 mt-3 mb-5 mx-1"></div>

    <!--
      社交链接图标组（四列网格）
      - 仅在有有效链接时渲染
      - 动态组件：可点击的渲染为 <a>，不可点击的渲染为 <span>（灰色禁用态）
      - 根据 platform 字段自动匹配图标（GitHub/Twitter/Email 等）
      - Email 类型不设 target="_blank"，其余外链均新标签页打开
    -->
    <div v-if="validLinks.length > 0" class="grid grid-cols-4 gap-1.5 sm:gap-2">
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
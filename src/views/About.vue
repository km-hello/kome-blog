<!-- About.vue - 关于页 -->
<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {ChevronRight} from 'lucide-vue-next'
import AppHeader from '@/components/common/AppHeader.vue'
import ProfileCard from '@/components/sidebar/ProfileCard.vue'
import ProfileCardSkeleton from '@/components/skeleton/ProfileCardSkeleton.vue'
import SetupHint from '@/components/sidebar/SetupHint.vue'
import SiteFooter from '@/components/sidebar/SiteFooter.vue'
import SkillCard from '@/components/sidebar/SkillCard.vue'
import SkillCardSkeleton from '@/components/skeleton/SkillCardSkeleton.vue'
import RepoCard from '@/components/sidebar/RepoCard.vue'
import PageTitleCard from '@/components/common/PageTitleCard.vue'
import {useSiteStore} from '@/stores/useSiteStore'
import {useSidebarDrawer} from '@/composables/useSidebarDrawer'

const siteStore = useSiteStore()
const {isLg} = useSidebarDrawer()
const {t} = useI18n()

/** 当前展开的功能分组（默认展开第一组） */
const expandedGroup = ref('about.features.blog.label')

/**
 * 功能特性分组（Blog / Admin / API）
 */
const featureGroups = [
  {
    labelKey: 'about.features.blog.label',
    features: [
      { titleKey: 'about.features.blog.articles.title', descKey: 'about.features.blog.articles.desc' },
      { titleKey: 'about.features.blog.archive.title', descKey: 'about.features.blog.archive.desc' },
      { titleKey: 'about.features.blog.memos.title', descKey: 'about.features.blog.memos.desc' },
      { titleKey: 'about.features.blog.links.title', descKey: 'about.features.blog.links.desc' },
      { titleKey: 'about.features.blog.i18n.title', descKey: 'about.features.blog.i18n.desc' },
      { titleKey: 'about.features.blog.about.title', descKey: 'about.features.blog.about.desc' },
    ],
  },
  {
    labelKey: 'about.features.admin.label',
    features: [
      { titleKey: 'about.features.admin.dashboard.title', descKey: 'about.features.admin.dashboard.desc' },
      { titleKey: 'about.features.admin.content.title', descKey: 'about.features.admin.content.desc' },
      { titleKey: 'about.features.admin.editor.title', descKey: 'about.features.admin.editor.desc' },
      { titleKey: 'about.features.admin.ai.title', descKey: 'about.features.admin.ai.desc' },
      { titleKey: 'about.features.admin.i18n.title', descKey: 'about.features.admin.i18n.desc' },
      { titleKey: 'about.features.admin.auth.title', descKey: 'about.features.admin.auth.desc' },
    ],
  },
  {
    labelKey: 'about.features.api.label',
    features: [
      { titleKey: 'about.features.api.rest.title', descKey: 'about.features.api.rest.desc' },
      { titleKey: 'about.features.api.auth.title', descKey: 'about.features.api.auth.desc' },
      { titleKey: 'about.features.api.ai.title', descKey: 'about.features.api.ai.desc' },
      { titleKey: 'about.features.api.db.title', descKey: 'about.features.api.db.desc' },
      { titleKey: 'about.features.api.validation.title', descKey: 'about.features.api.validation.desc' },
      { titleKey: 'about.features.api.docs.title', descKey: 'about.features.api.docs.desc' },
    ],
  },
]

/**
 * 技术栈分组（Blog / Admin / API）
 */
const techStacks = [
  {
    labelKey: 'about.features.blog.label',
    items: ['Vue 3', 'TypeScript', 'Vite', 'Tailwind CSS v4', 'Vue Router', 'Pinia', 'Axios', 'Lucide Icons', 'VueUse', 'vue-i18n', 'vue-sonner', 'Marked', 'highlight.js', 'KaTeX', 'Mermaid'],
  },
  {
    labelKey: 'about.features.admin.label',
    items: ['Vue 3', 'TypeScript', 'Vite', 'Tailwind CSS v4', 'Vue Router', 'Pinia', 'Axios', 'Lucide Icons', 'VueUse', 'vue-i18n', 'vue-sonner', 'shadcn-vue', 'Reka UI', 'TanStack Table', 'CodeMirror', 'emoji-picker-element'],
  },
  {
    labelKey: 'about.features.api.label',
    items: ['Spring Boot 3', 'Java 21', 'MyBatis-Plus', 'MySQL', 'Spring Security', 'JWT (JJWT)', 'WebFlux', 'Flyway', 'Springdoc OpenAPI', 'Lombok', 'Spring Actuator'],
  },
]

onMounted(() => {
  siteStore.fetchSiteInfo()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader/>

    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- 主内容区（>= lg 占 8 栏） -->
      <main class="lg:col-span-8 flex flex-col gap-6">
        <PageTitleCard
            :title="t('about.title')"
            :subtitle="t('about.subtitle')"
        />

        <!-- 项目介绍 + 功能特性 -->
        <div class="bento-card p-6">
          <h2 class="text-sm font-bold text-slate-900 mb-2">{{ t('about.project') }}</h2>
          <p class="text-sm text-slate-500 leading-relaxed mb-5">{{ t('about.projectDesc') }}</p>
          <!-- 功能特性分组（手风琴） -->
          <div class="space-y-2">
            <div v-for="group in featureGroups" :key="group.labelKey">
              <button
                  class="flex items-center gap-1.5 text-xs font-bold text-slate-400 tracking-widest uppercase w-full text-left py-1.5 hover:text-slate-500 transition-colors"
                  @click="expandedGroup = expandedGroup === group.labelKey ? '' : group.labelKey"
              >
                <ChevronRight
                    :class="['size-3.5 transition-transform duration-200', expandedGroup === group.labelKey && 'rotate-90']"
                />
                {{ t(group.labelKey) }}
              </button>
              <div
                  :class="['grid transition-[grid-template-rows] duration-200 ease-in-out', expandedGroup === group.labelKey ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]']"
              >
                <div class="overflow-hidden">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pb-1">
                    <div
                        v-for="feature in group.features"
                        :key="feature.titleKey"
                        class="p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <h3 class="text-sm font-semibold text-slate-800">{{ t(feature.titleKey) }}</h3>
                      <p class="text-xs text-slate-500 mt-1 leading-relaxed">{{ t(feature.descKey) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 技术栈 -->
        <div class="bento-card p-6">
          <h2 class="text-sm font-bold text-slate-900 mb-5">{{ t('about.techStack') }}</h2>
          <!-- 技术栈网格（1列 → md 3列） -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div v-for="stack in techStacks" :key="stack.labelKey">
              <h3 class="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">{{ t(stack.labelKey) }}</h3>
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

      <!-- 侧边栏（< lg Teleport 至抽屉 / >= lg sticky 右侧） -->
      <aside class="lg:col-span-4 relative">
        <Teleport to="#sidebar-drawer-content" :disabled="isLg">
          <div class="sticky top-24 space-y-5">
            <ProfileCard v-if="siteStore.siteInfo" :owner="siteStore.siteInfo.owner" :stats="siteStore.siteInfo.stats"/>
            <SetupHint v-else-if="siteStore.initialized === false"/>
            <ProfileCardSkeleton v-else/>

            <SkillCardSkeleton v-if="siteStore.loading"/>
            <SkillCard v-else :skills="siteStore.siteInfo?.owner.skills ?? null"/>

            <RepoCard/>

            <SiteFooter/>
          </div>
        </Teleport>
      </aside>
    </div>
  </div>
</template>

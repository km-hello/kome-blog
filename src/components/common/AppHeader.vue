<!-- AppHeader.vue - 顶部导航栏 -->
<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import {Menu, X, PanelRight, Languages} from 'lucide-vue-next'
import {useRoute} from 'vue-router'
import {useI18n} from 'vue-i18n'
import {useSidebarDrawer} from '@/composables/useSidebarDrawer'
import {setLocale} from '@/i18n'

const route = useRoute()
const {toggle: toggleSidebar} = useSidebarDrawer()
const {t, locale} = useI18n()

/**
 * 移动端菜单展开状态
 */
const mobileMenuOpen = ref(false)

/**
 * 文章详情页不显示侧边栏抽屉按钮
 */
const showSidebarButton = computed(() => route.name !== 'PostDetail')

/**
 * 导航菜单项（响应式，支持语言切换）
 */
const navItems = computed(() => [
  {label: t('nav.home'), path: '/'},
  {label: t('nav.archive'), path: '/archive'},
  {label: t('nav.memos'), path: '/memos'},
  {label: t('nav.links'), path: '/links'},
  {label: t('nav.about'), path: '/about'},
])

/**
 * 外部链接列表
 */
const externalLinks: { label: string; href: string }[] = []

/**
 * 判断路由是否活跃
 * @param path 路由路径
 */
const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

/**
 * 切换中英文语言
 */
const toggleLanguage = () => {
  const next = locale.value === 'en' ? 'zh-CN' : 'en'
  setLocale(next as 'en' | 'zh-CN')
}

/**
 * 路由变化时自动关闭移动端菜单
 */
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <!-- 导航栏（sticky 顶部，毛玻璃背景） -->
  <header class="bg-white/90 backdrop-blur-2xl saturate-150 sticky top-0 z-50"
          style="border-bottom: 1px solid rgba(0, 0, 0, 0.06); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02)">
    <div class="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-3">
        <div
            class="size-9 bg-slate-900 rounded-md flex items-center justify-center text-white text-lg font-bold shadow-md">
          K
        </div>
        <h1 class="font-bold text-slate-900 text-base">{{ t('brand.blogName') }}</h1>
      </router-link>

      <!-- 桌面导航（>= lg） -->
      <nav class="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-500">
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
        <!-- 语言切换按钮 -->
        <button
            class="p-2 rounded-md transition-colors hover:text-slate-900 hover:bg-slate-100"
            :title="t('nav.toggleLanguage')"
            @click="toggleLanguage"
        >
          <Languages :size="16"/>
        </button>
      </nav>

      <!-- 移动端按钮组（< lg）：侧边栏抽屉 + 语言切换 + 汉堡菜单 -->
      <div class="flex items-center gap-1 lg:hidden">
        <!-- 侧边栏抽屉按钮（文章详情页隐藏） -->
        <button
            v-if="showSidebarButton"
            class="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            @click="toggleSidebar"
        >
          <PanelRight :size="20"/>
        </button>

        <!-- 语言切换按钮 -->
        <button
            class="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            :title="t('nav.toggleLanguage')"
            @click="toggleLanguage"
        >
          <Languages :size="20"/>
        </button>

        <!-- 汉堡菜单按钮 -->
        <button
            class="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <Menu v-if="!mobileMenuOpen" :size="20"/>
          <X v-else :size="20"/>
        </button>
      </div>
    </div>

    <!-- 移动端下拉菜单（< lg，Transition 动画展开/收起） -->
    <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
    >
      <nav v-show="mobileMenuOpen" class="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl">
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

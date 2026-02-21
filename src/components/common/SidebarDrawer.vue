<!--
  src/components/common/SidebarDrawer.vue
  移动端侧边栏抽屉 —— 从右侧滑入，仅在 < lg 屏幕下可见

  使用方式：
    在 App.vue 中全局挂载，各页面通过 <Teleport to="#sidebar-drawer-content">
    将侧边栏组件传送到抽屉内部
-->
<script setup lang="ts">
import { watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useSidebarDrawer } from '@/composables/useSidebarDrawer'

const route = useRoute()
const { isOpen, close } = useSidebarDrawer()

// 路由变化时自动关闭抽屉
watch(() => route.path, () => close())
</script>

<template>
  <!-- 遮罩层 -->
  <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
  >
    <div
        v-if="isOpen"
        class="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        @click="close"
    />
  </Transition>

  <!-- 抽屉面板（始终挂载以保证 Teleport 目标存在） -->
  <aside
      class="lg:hidden fixed top-0 right-0 bottom-0 z-50 w-[24rem] max-w-[92vw] bg-white shadow-2xl flex flex-col transition-transform duration-250 ease-out"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
  >
    <!-- 顶部标题栏 -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <span class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Menu</span>
      <button
          class="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          @click="close"
      >
        <X :size="18" />
      </button>
    </div>

    <!-- 内容区：Teleport 目标（始终存在于 DOM 中） -->
    <div
        id="sidebar-drawer-content"
        class="sidebar-drawer-content flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-5 scrollbar-thin"
    />
  </aside>
</template>

<!-- App.vue - 应用根组件 -->
<script setup lang="ts">
import {Toaster} from "vue-sonner";
import SidebarDrawer from '@/components/common/SidebarDrawer.vue'
</script>

<template>
  <!--
    KeepAlive 仅缓存 Home 组件：
    - 从文章详情返回时保持滚动位置（DOM 完整保留，scrollBehavior savedPosition 可还原）
    - 避免每次返回触发骨架屏闪烁，数据在后台静默刷新
    - 配合 Home.vue 中的 onActivated 处理页码同步和数据更新
  -->
  <router-view v-slot="{ Component }">
    <keep-alive include="Home">
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <SidebarDrawer />
  <Toaster position="top-right" :duration="3000" richColors />
</template>


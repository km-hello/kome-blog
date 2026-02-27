<!--
  SetupHint.vue - 系统未初始化提示卡片

  功能：当站点信息尚未配置时显示，引导用户前往管理端完成初始配置。
        通常作为 ProfileCard 的降级替代组件，在侧边栏中展示。
-->
<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
</script>

<template>
  <!-- 未初始化提示卡片（居中布局：图标 → 标题 → 描述） -->
  <div class="bento-card p-6">
    <div class="flex flex-col items-center text-center py-4">
      <!-- 设置图标（圆形灰底容器） -->
      <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Settings class="w-6 h-6 text-slate-400" />
      </div>
      <!-- 提示标题 -->
      <h3 class="font-bold text-slate-700 mb-2">System Not Initialized</h3>
      <!-- 引导文案 -->
      <p class="text-sm text-slate-500 leading-relaxed">
        Please visit the admin panel to complete the initial setup.
      </p>
    </div>
  </div>
</template>

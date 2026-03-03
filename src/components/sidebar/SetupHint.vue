<!-- SetupHint.vue - 系统未初始化提示卡片 -->
<script setup lang="ts">
import {Settings} from 'lucide-vue-next'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()
</script>

<template>
  <!-- 未初始化提示（居中：图标 → 标题 → 描述） -->
  <div class="bento-card p-6">
    <div class="flex flex-col items-center text-center py-4">
      <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Settings class="w-6 h-6 text-slate-400"/>
      </div>
      <h3 class="font-bold text-slate-700 mb-2">{{ t('sidebar.setupNotInitialized') }}</h3>
      <p class="text-sm text-slate-500 leading-relaxed">
        {{ t('sidebar.setupDescription') }}
      </p>
    </div>
  </div>
</template>

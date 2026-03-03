<!-- NotFound.vue - 404 页面 -->
<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import {FileQuestion} from 'lucide-vue-next'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader/>

    <!-- 居中 404 提示卡片 -->
    <div class="flex-1 flex items-center justify-center px-4 py-16">
      <div class="bento-card p-10 text-center max-w-md w-full">
        <FileQuestion class="w-12 h-12 text-slate-300 mx-auto mb-4"/>
        <h1 class="text-6xl font-bold text-slate-900 mb-2">{{ t('notFound.title') }}</h1>
        <p class="text-lg text-slate-500 mb-1">{{ t('notFound.heading') }}</p>
        <p class="text-sm text-slate-400 mb-6">{{ t('notFound.description') }}</p>
        <RouterLink
            to="/"
            class="inline-block px-5 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 transition-colors"
        >
          {{ t('notFound.backToHome') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

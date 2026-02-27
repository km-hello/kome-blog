<!--
  Preview.vue - 文章预览页

  功能：作为管理端文章编辑器的 iframe 预览接收端，
        通过 postMessage 接收 Markdown 内容并实时渲染。

  安全：仅接受同源或 VITE_ALLOWED_ORIGINS 配置的来源消息。
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useMarkdown, renderMermaidCharts } from '@/composables/useMarkdown'

// ========== 状态定义 ==========

/** 允许的消息来源（开发环境通过环境变量配置） */
const allowedOrigins = (import.meta.env.VITE_ALLOWED_ORIGINS || '').split(',').filter(Boolean)

/** 原始 Markdown 内容 */
const content = ref('')
/** 渲染后的 HTML */
const renderedHtml = ref('')
const { render } = useMarkdown()

// ========== 方法 ==========

/**
 * 处理 postMessage 消息事件。
 * 验证消息来源安全性后，提取预览内容更新到 content。
 *
 * @param event 消息事件对象。
 */
const handleMessage = (event: MessageEvent) => {
    // 1. 验证来源：仅接受同源或开发环境允许的 origins
    const isAllowed = event.origin === window.location.origin
        || allowedOrigins.includes(event.origin)

    if (!isAllowed) {
        console.warn('Rejected message from untrusted origin:', event.origin)
        return
    }

    // 2. 验证消息格式并提取内容
    if (event.data?.type === 'preview' && typeof event.data.content === 'string') {
        content.value = event.data.content
    }
}

// ========== 侦听器 ==========

/** 监听内容变化，渲染 Markdown 并初始化 Mermaid 图表 */
watch(content, async (newContent) => {
    if (newContent) {
        renderedHtml.value = render(newContent)
        // DOM 更新后渲染 Mermaid 图表
        await nextTick()
        await renderMermaidCharts()
    } else {
        renderedHtml.value = ''
    }
})

// ========== 生命周期 ==========

onMounted(() => {
    window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
    window.removeEventListener('message', handleMessage)
})
</script>

<template>
    <div class="preview-page">
        <!-- Markdown 渲染内容 -->
        <div
            v-if="renderedHtml"
            class="markdown-body"
            v-html="renderedHtml"
        ></div>
        <!-- 等待内容提示 -->
        <div v-else class="empty-state">
            <p>等待内容...</p>
        </div>
    </div>
</template>

<style scoped>
.preview-page {
    min-height: 100vh;
    padding: 1rem;
    background: #fff;
}

@media (min-width: 640px) {
  .preview-page {
    padding: 2rem;
  }
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    color: #94a3b8;
    font-size: 0.875rem;
}
</style>

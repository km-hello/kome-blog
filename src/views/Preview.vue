<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useMarkdown, renderMermaidCharts } from '@/composables/useMarkdown'

// 允许的来源（开发环境通过环境变量配置）
const allowedOrigins = (import.meta.env.VITE_ALLOWED_ORIGINS || '').split(',').filter(Boolean)

const content = ref('')
const renderedHtml = ref('')
const { render } = useMarkdown()

// 处理消息事件
const handleMessage = (event: MessageEvent) => {
    // 验证来源：同源 或 开发环境允许的 origins
    const isAllowed = event.origin === window.location.origin
        || allowedOrigins.includes(event.origin)

    if (!isAllowed) {
        console.warn('Rejected message from untrusted origin:', event.origin)
        return
    }

    // 验证消息类型
    if (event.data?.type === 'preview' && typeof event.data.content === 'string') {
        content.value = event.data.content
    }
}

// 监听内容变化，渲染 markdown
watch(content, async (newContent) => {
    if (newContent) {
        renderedHtml.value = render(newContent)
        // DOM 更新后渲染 mermaid 图表
        await nextTick()
        await renderMermaidCharts()
    } else {
        renderedHtml.value = ''
    }
})

onMounted(() => {
    window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
    window.removeEventListener('message', handleMessage)
})
</script>

<template>
    <div class="preview-page">
        <div
            v-if="renderedHtml"
            class="markdown-body"
            v-html="renderedHtml"
        ></div>
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

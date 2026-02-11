<!--
  src/components/common/MermaidModal.vue
  Mermaid 图表放大模态框 —— 自包含的可复用组件

  功能概览:
    - 通过事件委托自动监听 .mermaid-container.mermaid-rendered 的点击
    - 模态框内支持缩放：按钮控制 + Ctrl/Cmd+滚轮
    - ESC 键或点击遮罩关闭
    - 使用 Teleport 挂载到 body，避免被父容器 overflow 裁切

  使用方式:
    在需要 Mermaid 点击放大功能的页面组件模板末尾添加 <MermaidModal />
    无需传入任何 props，组件通过事件委托自动处理页面内所有 Mermaid 图表
-->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-vue-next'

/* ==================== 响应式状态 ==================== */

/** 模态框是否打开 */
const modalOpen = ref(false)
/** 模态框中渲染的 SVG 字符串（已移除固定尺寸，改由 CSS 控制） */
const svgContent = ref('')
/** 当前缩放倍率，默认 1 = 100% */
const zoom = ref(1)
/** SVG 原始宽高，作为缩放计算的基准 */
const originalWidth = ref(0)
const originalHeight = ref(0)

/* ==================== 核心逻辑 ==================== */

/**
 * 打开 Mermaid 放大模态框
 * 1. 解析 SVG 字符串，提取原始宽高（优先 width/height 属性，其次 viewBox）
 * 2. 移除 SVG 的固定尺寸属性，改为 100% 填充容器
 * 3. 锁定 body 滚动，防止背景页面跟随滚动
 */
const openModal = (content: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'image/svg+xml')
  const svg = doc.querySelector('svg')
  if (!svg) return

  // 提取原始尺寸：优先读取 width/height 属性，回退到 viewBox
  let w = parseFloat(svg.getAttribute('width') || '0')
  let h = parseFloat(svg.getAttribute('height') || '0')
  if (!w || !h) {
    const vb = svg.getAttribute('viewBox')?.split(/\s+/).map(Number)
    if (vb && vb.length === 4) {
      w = vb[2] ?? 0
      h = vb[3] ?? 0
    }
  }

  // 兜底默认值，避免 0 宽高导致不可见
  originalWidth.value = w || 600
  originalHeight.value = h || 400

  // 移除固定尺寸，改为自适应容器
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  svg.setAttribute('style', 'width: 100%; height: 100%;')

  svgContent.value = svg.outerHTML
  zoom.value = 1
  modalOpen.value = true
  document.body.style.overflow = 'hidden'
}

/** 关闭模态框并恢复页面滚动 */
const closeModal = () => {
  modalOpen.value = false
  svgContent.value = ''
  zoom.value = 1
  document.body.style.overflow = ''
}

/** 根据缩放倍率计算实际显示尺寸 */
const displayWidth = computed(() => originalWidth.value * zoom.value)
const displayHeight = computed(() => originalHeight.value * zoom.value)

/** 放大：每次 +25%，上限 500% */
const zoomIn = () => {
  zoom.value = Math.min(zoom.value + 0.25, 5)
}

/** 缩小：每次 -25%，下限 25% */
const zoomOut = () => {
  zoom.value = Math.max(zoom.value - 0.25, 0.25)
}

/** 重置缩放为 100% */
const resetZoom = () => {
  zoom.value = 1
}

/* ==================== 事件处理器（事件委托） ==================== */

/**
 * Mermaid 图表点击放大
 * 通过事件委托监听 document 的 click 事件，匹配已渲染的 .mermaid-container
 */
const handleClick = (e: MouseEvent) => {
  const container = (e.target as HTMLElement).closest('.mermaid-container.mermaid-rendered') as HTMLElement | null
  if (!container) return

  const svg = container.querySelector('svg')
  if (svg) {
    openModal(svg.outerHTML)
  }
}

/** ESC 键关闭模态框 */
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && modalOpen.value) {
    closeModal()
  }
}

/**
 * Ctrl/Cmd + 滚轮 缩放 Mermaid 图表
 * passive: false 允许 preventDefault 阻止浏览器默认缩放行为
 */
const handleWheel = (e: WheelEvent) => {
  if (!modalOpen.value) return
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    // deltaY 转换为缩放增量，每次变化约 0.1%（连续滚动体验更平滑）
    const delta = -e.deltaY * 0.001
    const newZoom = Math.min(5, Math.max(0.25, zoom.value + delta))
    zoom.value = Math.round(newZoom * 100) / 100
  }
}

/* ==================== 生命周期 ==================== */

onMounted(() => {
  document.addEventListener('click', handleClick)
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('wheel', handleWheel, { passive: false })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClick)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('wheel', handleWheel)
  // 确保组件卸载时恢复 body 滚动
  document.body.style.overflow = ''
})
</script>

<template>
  <!-- 使用 Teleport 挂载到 body，避免被父容器 overflow 裁切 -->
  <Teleport to="body">
    <Transition
        enter-active-class="transition-opacity duration-200 ease-in-out"
        leave-active-class="transition-opacity duration-200 ease-in-out"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
    >
      <div
          v-if="modalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="closeModal"
      >
        <!-- 半透明遮罩 -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>

        <!-- 模态框主体 -->
        <div class="relative w-[70vw] h-[70vh] bg-white rounded-xl shadow-2xl flex flex-col">
          <!-- 顶部工具栏：缩放控制 + 关闭按钮 -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <button
                  class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  title="Ctrl + Scroll Down"
                  @click="zoomOut"
              >
                <ZoomOut :size="18" />
              </button>
              <span class="text-sm text-slate-600 min-w-16 text-center">{{ Math.round(zoom * 100) }}%</span>
              <button
                  class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  title="Ctrl + Scroll Up"
                  @click="zoomIn"
              >
                <ZoomIn :size="18" />
              </button>
              <button
                  class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  title="Reset"
                  @click="resetZoom"
              >
                <RotateCcw :size="18" />
              </button>
            </div>
            <button
                class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                title="Close (Esc)"
                @click="closeModal"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- SVG 内容区域：支持滚动和缩放 -->
          <div class="flex-1 overflow-auto scrollbar-thin p-6 bg-slate-50 rounded-b-xl">
            <div class="inline-flex min-h-full min-w-full items-center justify-center">
              <div
                  class="shrink-0 transition-[width,height] duration-200 [&_svg]:block [&_svg]:size-full"
                  :style="{ width: displayWidth + 'px', height: displayHeight + 'px' }"
                  v-html="svgContent"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

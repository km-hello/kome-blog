<!-- MermaidModal.vue - Mermaid 图表放大模态框 -->
<script setup lang="ts">
import {ref, computed, nextTick, onMounted, onUnmounted} from 'vue'
import {X, ZoomIn, ZoomOut, RotateCcw} from 'lucide-vue-next'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()

const DEFAULT_SVG_WIDTH = 600
const DEFAULT_SVG_HEIGHT = 400
const SVG_PADDING = 16
const ZOOM_STEP = 0.25
const MIN_ZOOM = 0.25
const MAX_ZOOM = 5

/** 模态框是否打开 */
const modalOpen = ref(false)
/** 模态框中展示的 Mermaid SVG 字符串 */
const svgContent = ref('')
/** 当前缩放倍率，1 = 100% */
const zoom = ref(1)
/** SVG 基准尺寸，用于计算缩放后的展示宽高 */
const originalWidth = ref(0)
const originalHeight = ref(0)
/** SVG 挂载容器，用于在真实 DOM 中测量图形尺寸 */
const svgStage = ref<HTMLElement | null>(null)

/** 读取 SVG 的基础宽高，优先 width/height，其次 viewBox */
const resolveSvgSize = (svg: SVGSVGElement) => {
  let width = parseFloat(svg.getAttribute('width') || '0')
  let height = parseFloat(svg.getAttribute('height') || '0')
  const viewBox = svg.getAttribute('viewBox')?.split(/\s+/).map(Number)

  if ((!width || !height) && viewBox && viewBox.length === 4) {
    width = viewBox[2] ?? 0
    height = viewBox[3] ?? 0
  }

  return {
    width: width || DEFAULT_SVG_WIDTH,
    height: height || DEFAULT_SVG_HEIGHT,
  }
}

/** 根据图形真实包围盒修正 viewBox，避免放大视图裁切右侧或底部内容 */
const expandSvgViewBox = (svg: SVGSVGElement, width: number, height: number) => {
  try {
    const bbox = svg.getBBox()
    if (bbox.width <= 0 || bbox.height <= 0) {
      return {width, height}
    }

    const boxX = Math.floor(bbox.x - SVG_PADDING)
    const boxY = Math.floor(bbox.y - SVG_PADDING)
    const boxWidth = Math.ceil(bbox.width + SVG_PADDING * 2)
    const boxHeight = Math.ceil(bbox.height + SVG_PADDING * 2)

    svg.setAttribute('viewBox', `${boxX} ${boxY} ${boxWidth} ${boxHeight}`)
    return {
      width: Math.max(width, boxWidth),
      height: Math.max(height, boxHeight),
    }
  } catch (error) {
    console.warn('Mermaid modal bbox measure failed:', error)
    return {width, height}
  }
}

/** 去除 Mermaid 默认尺寸约束，交由外层容器控制缩放 */
const applySvgLayout = (svg: SVGSVGElement) => {
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  svg.style.width = '100%'
  svg.style.height = '100%'
  svg.style.maxWidth = 'none'
  svg.style.maxHeight = 'none'
  svg.style.display = 'block'
  svg.style.overflow = 'visible'
}

/** 锁定或恢复 body 滚动 */
const setBodyScrollLocked = (locked: boolean) => {
  document.body.style.overflow = locked ? 'hidden' : ''
}

/** 打开 Mermaid 放大模态框并在真实 DOM 中校正 SVG 尺寸 */
const openModal = async (content: string) => {
  svgContent.value = content
  originalWidth.value = DEFAULT_SVG_WIDTH
  originalHeight.value = DEFAULT_SVG_HEIGHT
  zoom.value = 1
  modalOpen.value = true
  setBodyScrollLocked(true)

  await nextTick()

  const svg = svgStage.value?.querySelector('svg') as SVGSVGElement | null
  if (!svg) {
    closeModal()
    return
  }

  const baseSize = resolveSvgSize(svg)
  const finalSize = expandSvgViewBox(svg, baseSize.width, baseSize.height)
  originalWidth.value = finalSize.width
  originalHeight.value = finalSize.height
  applySvgLayout(svg)
}

/** 关闭模态框并恢复页面滚动 */
const closeModal = () => {
  modalOpen.value = false
  svgContent.value = ''
  zoom.value = 1
  setBodyScrollLocked(false)
}

/** 根据缩放倍率计算实际显示尺寸 */
const displayWidth = computed(() => originalWidth.value * zoom.value)
const displayHeight = computed(() => originalHeight.value * zoom.value)

/** 每次放大 25%，上限 500% */
const zoomIn = () => {
  zoom.value = Math.min(zoom.value + ZOOM_STEP, MAX_ZOOM)
}

/** 每次缩小 25%，下限 25% */
const zoomOut = () => {
  zoom.value = Math.max(zoom.value - ZOOM_STEP, MIN_ZOOM)
}

/** 重置缩放为 100% */
const resetZoom = () => {
  zoom.value = 1
}

/** 通过事件委托监听正文中的 Mermaid 图表点击 */
const handleClick = (e: MouseEvent) => {
  const container = (e.target as HTMLElement).closest('.mermaid-container.mermaid-rendered') as HTMLElement | null
  if (!container) return

  const svg = container.querySelector('svg')
  if (!svg) return

  openModal(svg.outerHTML).catch((error) => {
    console.error('Mermaid modal render error:', error)
  })
}

/** ESC 键关闭模态框 */
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && modalOpen.value) {
    closeModal()
  }
}

/** Ctrl/Cmd + 滚轮缩放图表，并阻止浏览器默认页面缩放 */
const handleWheel = (e: WheelEvent) => {
  if (!modalOpen.value) return
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    const delta = -e.deltaY * 0.001
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom.value + delta))
    zoom.value = Math.round(newZoom * 100) / 100
  }
}

/** 注册 Mermaid 弹窗相关事件 */
onMounted(() => {
  document.addEventListener('click', handleClick)
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('wheel', handleWheel, {passive: false})
})

/** 移除事件监听并恢复页面滚动 */
onUnmounted(() => {
  document.removeEventListener('click', handleClick)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('wheel', handleWheel)
  setBodyScrollLocked(false)
})
</script>

<template>
  <!-- Teleport 到 body，避免父容器 overflow 裁切 -->
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
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>

        <!-- 模态框（移动端 95vw/85vh → sm 85vw/80vh → md 70vw/70vh） -->
        <div
            class="relative w-[95vw] h-[85vh] sm:w-[85vw] sm:h-[80vh] md:w-[70vw] md:h-[70vh] bg-white rounded-xl shadow-2xl flex flex-col">
          <!-- 工具栏：缩放按钮（移动端 p-2.5 / sm+ p-2）+ 关闭 -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <button
                  class="p-2.5 sm:p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  :title="t('mermaid.zoomOut')"
                  @click="zoomOut"
              >
                <ZoomOut :size="18"/>
              </button>
              <span class="text-sm text-slate-600 min-w-16 text-center">{{ Math.round(zoom * 100) }}%</span>
              <button
                  class="p-2.5 sm:p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  :title="t('mermaid.zoomIn')"
                  @click="zoomIn"
              >
                <ZoomIn :size="18"/>
              </button>
              <button
                  class="p-2.5 sm:p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  :title="t('mermaid.reset')"
                  @click="resetZoom"
              >
                <RotateCcw :size="18"/>
              </button>
            </div>
            <button
                class="p-2.5 sm:p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                :title="t('mermaid.close')"
                @click="closeModal"
            >
              <X :size="18"/>
            </button>
          </div>

          <!-- SVG 内容（可滚动 + 缩放） -->
          <div class="flex-1 overflow-auto scrollbar-thin p-6 bg-slate-50 rounded-b-xl">
            <div class="inline-flex min-h-full min-w-full items-center justify-center">
              <div
                  ref="svgStage"
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

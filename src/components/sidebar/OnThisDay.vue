<!-- OnThisDay.vue - 往年今日 Memo 卡片 -->
<script setup lang="ts">
import {ref, watch, nextTick} from 'vue'
import {CalendarHeart} from 'lucide-vue-next'
import {useI18n} from 'vue-i18n'
import type {MemoResponse} from '@/api/memo'
import {useMarkdown} from '@/composables/useMarkdown'

/**
 * Props 定义
 * @property memos 往年今日 Memo 列表
 */
const props = defineProps<{
  memos: MemoResponse[]
}>()

const {render} = useMarkdown()
const {t} = useI18n()

/**
 * 缓存每个 Memo 内容容器的 DOM 引用
 * 用于溢出检测（比较 scrollHeight 与 clientHeight）
 */
const contentRefs = ref<Map<number, HTMLElement>>(new Map())

/**
 * 记录每个 Memo 内容是否溢出（超过 4 行）
 */
const overflowMap = ref<Map<number, boolean>>(new Map())

/**
 * 模板 ref 回调：收集每个 Memo 内容容器的 DOM 元素
 */
const setContentRef = (id: number, el: HTMLElement | null) => {
  if (el) contentRefs.value.set(id, el)
}

/**
 * 遍历所有 Memo 内容容器，检测是否存在内容溢出
 */
const checkOverflow = () => {
  for (const [id, el] of contentRefs.value) {
    overflowMap.value.set(id, el.scrollHeight > el.clientHeight)
  }
}

/**
 * 从 ISO 日期字符串中提取 YYYY-MM-DD 部分
 */
const formatDate = (dateStr: string): string => {
  return dateStr.split('T')[0] ?? dateStr
}

/**
 * 监听 memos 数据变化，等待 DOM 更新后检测溢出
 */
watch(() => props.memos, async () => {
  await nextTick()
  checkOverflow()
}, {flush: 'post'})
</script>

<template>
  <div class="bento-card p-5">
    <!-- 标题栏 -->
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest">{{ t('sidebar.onThisDay') }}</h4>
    </div>

    <!-- Memo 列表（超过 4 条时出现滚动条） -->
    <div v-if="memos.length > 0" class="space-y-3 max-h-[28rem] overflow-y-auto">
      <router-link
          v-for="memo in memos"
          :key="memo.id"
          to="/memos"
          class="p-3 rounded-lg block bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors group"
      >
        <div class="flex gap-3 items-start">
          <CalendarHeart :size="12" class="text-slate-300 mt-1 shrink-0"/>
          <div class="flex-1 min-w-0">
            <!-- 内容区域（max-h 4行截断，溢出时底部渐变遮罩） -->
            <div class="relative">
              <div
                  :ref="(el: any) => setContentRef(memo.id, el)"
                  class="max-h-[calc(4*1.5em)] overflow-hidden markdown-body markdown-mini"
                  v-html="render(memo.content)"
              ></div>
              <!-- 溢出渐变遮罩 -->
              <div
                  v-if="overflowMap.get(memo.id)"
                  class="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-r from-slate-50 group-hover:from-slate-100 to-transparent pointer-events-none transition-colors"
              ></div>
            </div>
            <!-- 年份标签 -->
            <div class="flex items-center gap-2 mt-2">
              <span class="size-1 bg-slate-300 rounded-full"></span>
              <span class="text-[10px] text-slate-400 font-mono tracking-tight">
                {{ formatDate(memo.createTime) }}
              </span>
            </div>
          </div>
        </div>
      </router-link>
    </div>

    <!-- 空状态 -->
    <div v-if="memos.length === 0" class="text-center py-4 text-xs text-slate-400">
      {{ t('sidebar.noOnThisDay') }}
    </div>
  </div>
</template>

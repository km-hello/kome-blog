<!-- TagList.vue - 标签列表组件 -->
<script setup lang="ts">
import SidebarSkeleton from '@/components/skeleton/SidebarSkeleton.vue'
import { useI18n } from 'vue-i18n'
import type {TagPostCountResponse} from '@/api/tag'

const {t} = useI18n()

/**
 * Props 定义
 * @property tags 标签数组（TagPostCountResponse[]，含名称和文章计数）
 * @property activeTagId 当前选中的标签 ID（null 表示无选中）
 * @property loading 加载状态（控制骨架屏显示）
 */
defineProps<{
  tags: TagPostCountResponse[]
  activeTagId?: number | null
  loading?: boolean
}>()

/**
 * 事件定义
 * @event select 标签选择事件，tagId 为 null 表示取消筛选
 */
const emit = defineEmits<{
  select: [tagId: number | null]
}>()

/**
 * 处理标签点击事件，触发 select 事件。
 *
 * @param tagId 被点击的标签 ID。
 */
const handleTagClick = (tagId: number) => {
  emit('select', tagId)
}
</script>

<template>
  <div class="bento-card p-5">
    <!-- 标题栏 + 清除按钮（有选中标签时显示） -->
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-widest">{{ t('sidebar.tagsTitle') }}</h4>
      <button
          v-if="activeTagId"
          @click="emit('select', null)"
          class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 border border-slate-200 hover:border-rose-200 px-2 py-0.5 rounded-full transition-all"
      >
        <span class="leading-none">×</span>
        {{ t('sidebar.clearTags') }}
      </button>
    </div>

    <!-- 加载骨架屏 -->
    <SidebarSkeleton v-if="loading && tags.length === 0" variant="tags"/>

    <!-- 标签按钮组（flex 换行，max-h-60 超出滚动，选中深色/未选中浅灰） -->
    <div v-else class="flex flex-wrap gap-2 max-h-60 overflow-y-auto scrollbar-thin pr-1">
      <button
          v-for="tag in tags"
          :key="tag.id"
          @click="handleTagClick(tag.id)"
          class="px-3 py-1.5 rounded-md flex items-center gap-2 cursor-pointer border transition-colors"
          :class="activeTagId === tag.id
            ? 'bg-slate-200 border-slate-300 text-slate-800'
            : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900'"
      >
        <span class="text-xs font-bold">{{ tag.name }}</span>
        <!-- 文章计数徽标 -->
        <span
            class="text-[10px] font-mono px-1.5 rounded"
            :class="activeTagId === tag.id
              ? 'bg-slate-100 text-slate-500 border border-slate-300'
              : 'bg-white text-slate-400 border border-slate-200'"
        >
          {{ tag.postCount }}
        </span>
      </button>
    </div>

    <!-- 空状态提示 -->
    <div v-if="!loading && tags.length === 0" class="text-center py-4 text-xs text-slate-400">
      {{ t('sidebar.noTags') }}
    </div>
  </div>
</template>

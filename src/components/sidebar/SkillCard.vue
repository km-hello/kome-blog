<!-- SkillCard.vue - 技能卡片组件 -->
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SkillItem } from '@/api/site'

const { t } = useI18n()

/**
 * Props 定义
 * @property skills 技能列表数据（默认空数组）
 */
const props = withDefaults(defineProps<{
  skills?: SkillItem[]
}>(), {
  skills: () => [],
})

/**
 * 是否有技能数据
 */
const hasSkills = computed(() => (props.skills?.length ?? 0) > 0)

/**
 * 技能等级配置（3=Proficient / 2=Familiar / 1=Basic），含对应样式
 * 使用 computed 确保语言切换时标签响应式更新
 */
const levelConfig = computed(() => [
  {
    level: 3,
    label: t('sidebar.proficient'),
    tagClass: 'bg-slate-500/15 text-slate-700 border border-slate-300',
    dotClass: 'bg-slate-500',
  },
  {
    level: 2,
    label: t('sidebar.familiar'),
    tagClass: 'bg-slate-400/10 text-slate-500 border border-slate-200',
    dotClass: 'bg-slate-300',
  },
  {
    level: 1,
    label: t('sidebar.basic'),
    tagClass: 'bg-slate-50 text-slate-400 border border-slate-100',
    dotClass: 'bg-slate-200',
  },
])

/**
 * 按等级分组并排序后的技能列表（过滤空组）
 */
const levels = computed(() =>
  levelConfig.value
    .map(config => ({
      ...config,
      items: (props.skills ?? []).filter(s => s.level === config.level).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(s => s.name),
    }))
    .filter(group => group.items.length > 0)
)
</script>

<template>
  <div class="bento-card p-5">
    <h3 class="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-4">{{ t('sidebar.skillsTitle') }}</h3>

    <template v-if="hasSkills">
      <div class="space-y-3.5">
        <div v-for="level in levels" :key="level.label">
          <p class="text-[10px] font-medium text-slate-300 mb-1.5">{{ level.label }}</p>
          <div class="flex flex-wrap gap-1.5 gap-y-2">
            <span
                v-for="item in level.items"
                :key="item"
                class="px-2 py-0.5 text-[11px] font-medium rounded leading-relaxed"
                :class="level.tagClass"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-4 text-xs text-slate-400">
      {{ t('sidebar.noSkills') }}
    </div>
  </div>
</template>

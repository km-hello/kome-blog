<!-- src/components/sidebar/SkillCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { SkillItem } from '@/api/site'

const props = withDefaults(defineProps<{
  skills?: SkillItem[]
}>(), {
  skills: () => [],
})

const hasSkills = computed(() => (props.skills?.length ?? 0) > 0)

const levelConfig = [
  {
    level: 3,
    label: 'Proficient',
    tagClass: 'bg-slate-500/15 text-slate-700 border border-slate-300',
    dotClass: 'bg-slate-500',
  },
  {
    level: 2,
    label: 'Familiar',
    tagClass: 'bg-slate-400/10 text-slate-500 border border-slate-200',
    dotClass: 'bg-slate-300',
  },
  {
    level: 1,
    label: 'Basic',
    tagClass: 'bg-slate-50 text-slate-400 border border-slate-100',
    dotClass: 'bg-slate-200',
  },
]

const levels = computed(() =>
  levelConfig
    .map(config => ({
      ...config,
      items: (props.skills ?? []).filter(s => s.level === config.level).map(s => s.name),
    }))
    .filter(group => group.items.length > 0)
)
</script>

<template>
  <div class="bento-card p-5">
    <h3 class="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">Skills</h3>

    <template v-if="hasSkills">
      <div class="space-y-3">
        <div v-for="level in levels" :key="level.label">
          <div class="flex flex-wrap gap-1.5">
            <span
                v-for="item in level.items"
                :key="item"
                class="px-2 py-0.5 text-[11px] font-medium rounded"
                :class="level.tagClass"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
        <div v-for="config in levelConfig" :key="config.label" class="flex items-center gap-1.5">
          <span class="size-2 rounded-full" :class="config.dotClass" />
          <span class="text-[10px] text-slate-400">{{ config.label }}</span>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-4 text-xs text-slate-400">
      No skills configured
    </div>
  </div>
</template>

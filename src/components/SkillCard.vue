<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import SkillAvatar from '@/components/SkillAvatar.vue'
import { categoryLabel } from '@/data/categories'
import type { Skill, SkillStatus } from '@/types'

// 技能牆卡片(選角格子):頭像 slot 解耦——預設佔位色塊,#5 換 DiceBear,
// 未來換手繪/GIF 都只動 slot 內容。名稱+分類文字恆在(可用性硬規則)。
const props = defineProps<{ skill: Skill }>()
const emit = defineEmits<{ open: [id: string] }>()

const STATUS_META: Record<SkillStatus, { label: string; cls: string }> = {
  ready: { label: 'READY', cls: 'bg-success/15 text-success' },
  running: { label: 'RUNNING', cls: 'bg-warning/15 text-warning' },
  idle: { label: 'IDLE', cls: 'bg-muted text-muted-foreground' },
}
const status = () => STATUS_META[props.skill.status ?? 'ready']
</script>

<template>
  <button
    type="button"
    class="pixel-frame pixel-frame-interactive group flex flex-col items-stretch gap-3 rounded-lg bg-card p-4 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-none"
    :aria-label="`開啟 ${skill.name}`"
    @click="emit('open', skill.id)"
  >
    <div class="flex items-start justify-between gap-2">
      <slot name="avatar">
        <SkillAvatar :seed="skill.seed" />
      </slot>
      <span class="rounded px-1.5 py-0.5 font-pixel text-[9px]" :class="status().cls">
        {{ status().label }}
      </span>
    </div>
    <div>
      <p class="text-sm font-bold text-card-foreground">{{ skill.name }}</p>
      <p class="mt-1 line-clamp-2 text-xs text-muted-foreground">{{ skill.description }}</p>
    </div>
    <div class="mt-auto">
      <Badge variant="secondary" class="text-[10px]">{{ categoryLabel(skill.category) }}</Badge>
    </div>
  </button>
</template>

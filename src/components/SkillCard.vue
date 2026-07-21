<script setup lang="ts">
import SkillAvatar from '@/components/SkillAvatar.vue'
import PosePicker from '@/components/PosePicker.vue'
import { categoryLabel } from '@/data/categories'
import type { Skill, SkillStatus } from '@/types'

// 技能牆格子(MvC 選角風):方形立繪格 + 底部名條 + hover 金框游標。
// 頭像 slot 解耦——換手繪/GIF 只動 slot 內容。名稱文字恆在(可用性硬規則)。
// 姿勢選擇器是 button 的「兄弟」元素而非子元素——button 內不能巢狀互動元件,
// 也讓它的點擊天然不觸發開卡。
const props = defineProps<{ skill: Skill }>()
const emit = defineEmits<{ open: [id: string] }>()

const STATUS_META: Record<SkillStatus, { label: string; cls: string }> = {
  ready: { label: 'READY', cls: 'bg-success/20 text-success' },
  running: { label: 'RUN', cls: 'bg-warning/20 text-warning' },
  idle: { label: 'IDLE', cls: 'bg-muted text-muted-foreground' },
}
const status = () => STATUS_META[props.skill.status ?? 'ready']
</script>

<template>
  <div class="group relative">
    <button
      type="button"
      class="pixel-frame pixel-frame-interactive relative flex aspect-square w-full flex-col overflow-hidden rounded-lg bg-card text-left transition-transform group-hover:-translate-y-0.5 group-hover:ring-2 group-hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      :aria-label="`開啟 ${skill.name}`"
      @click="emit('open', skill.id)"
    >
      <span
        class="absolute right-1.5 top-1.5 z-10 rounded px-1 py-0.5 font-pixel text-[8px]"
        :class="status().cls"
      >
        {{ status().label }}
      </span>

      <div class="flex flex-1 items-center justify-center bg-accent/40 p-3">
        <slot name="avatar">
          <SkillAvatar :seed="skill.seed" :size="88" class="transition-transform group-hover:scale-110" />
        </slot>
      </div>

      <div class="border-t border-border bg-background/70 px-2 py-1.5">
        <p class="truncate text-center font-pixel text-[9px] leading-relaxed text-card-foreground group-hover:text-primary">
          {{ skill.name }}
        </p>
        <p class="truncate text-center text-[9px] text-muted-foreground">{{ categoryLabel(skill.category) }}</p>
      </div>
    </button>

    <!-- flex:消掉 inline line-box 的垂直空隙,讓 top 間距真的等於 left 間距;
         hover 位移跟卡片本體同步,懸浮時間距不跑掉 -->
    <div
      class="absolute left-1.5 top-1.5 z-10 flex opacity-0 transition focus-within:opacity-100 group-hover:-translate-y-0.5 group-hover:opacity-100"
    >
      <PosePicker :seed="skill.seed" :name="skill.name" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMagicKeys, whenever } from '@vueuse/core'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import SkillAvatar from '@/components/SkillAvatar.vue'
import { launchSkill } from '@/lib/launcher'
import type { Skill } from '@/types'

// Hotbar(EXT-001,遊戲 HUD action bar):釘選的 skill 一鍵發射。
// 點擊或數字鍵 1-9 = 直接複製調用 prompt(不開詳情,速度優先)。
const props = defineProps<{ pinned: Skill[] }>()

const keys = useMagicKeys()
for (let i = 1; i <= 9; i++) {
  whenever(keys[String(i)]!, () => {
    const el = document.activeElement as HTMLElement | null
    const typing = el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)
    if (typing) return
    const s = props.pinned[i - 1]
    if (s) void launchSkill(s)
  })
}
</script>

<template>
  <div v-if="pinned.length" class="pixel-frame mb-6 flex items-center gap-2 rounded-lg bg-card/70 p-2">
    <span class="px-1 font-pixel text-[9px] text-muted-foreground">HOTBAR</span>
    <Tooltip v-for="(s, i) in pinned.slice(0, 9)" :key="s.id">
      <TooltipTrigger as-child>
        <button
          type="button"
          class="pixel-frame pixel-frame-interactive relative rounded-md bg-secondary p-1"
          :aria-label="`發射 ${s.name}`"
          @click="launchSkill(s)"
        >
          <SkillAvatar :seed="s.seed" :size="36" />
          <Kbd class="absolute -bottom-1.5 -right-1.5 h-4 min-w-4 text-[9px]">{{ i + 1 }}</Kbd>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" class="text-xs">{{ s.name }} — 點擊或按 {{ i + 1 }} 複製調用</TooltipContent>
    </Tooltip>
  </div>
</template>

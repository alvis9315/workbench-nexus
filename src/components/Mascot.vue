<script setup lang="ts">
import { computed } from 'vue'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { spriteUrl } from '@/data/lpcSprites'

// 吉祥物(REQ-007):角落固定。2026-07-21 起改用 LPC sprite(與技能牆同風格),
// 淘汰 DiceBear。要換角色/姿勢改這兩個常數;三態動畫(ready/running/done)是 EXT-007。
const MASCOT_CHAR = 'D_paladin_blonde'
const MASCOT_POSE = 'spellcast_down'
const url = computed(() => spriteUrl(MASCOT_CHAR, MASCOT_POSE))
</script>

<template>
  <Tooltip v-if="url">
    <TooltipTrigger as-child>
      <div class="pixel-frame fixed bottom-5 right-5 z-40 rounded-lg bg-card p-2">
        <img :src="url" width="56" height="56" alt="工作站吉祥物" class="object-contain [image-rendering:pixelated]" />
      </div>
    </TooltipTrigger>
    <TooltipContent side="left" class="font-pixel text-[10px]">STANDING BY…</TooltipContent>
  </Tooltip>
</template>

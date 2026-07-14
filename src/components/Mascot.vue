<script setup lang="ts">
import { computed } from 'vue'
import { createAvatar } from '@dicebear/core'
import { pixelArt } from '@dicebear/collection'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// 吉祥物佔位(REQ-007):角落固定、idle 靜態。之後換 AI 生成像素 GIF
// 只要換 <img> 來源;三態動畫(ready/running/done)是 EXT-007。
const uri = computed(() =>
  createAvatar(pixelArt, { seed: 'nexus-mascot', size: 72 }).toDataUri(),
)
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <div class="pixel-frame fixed bottom-5 right-5 z-40 rounded-lg bg-card p-2">
        <img :src="uri" width="56" height="56" alt="工作站吉祥物" class="[image-rendering:pixelated]" />
      </div>
    </TooltipTrigger>
    <TooltipContent side="left" class="font-pixel text-[10px]">STANDING BY…</TooltipContent>
  </Tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { charForSeed, spriteUrl } from '@/data/lpcSprites'
import { useSpritePose } from '@/composables/useSpritePose'

// LPC sprite 頭像(2026-07-21 起取代 DiceBear 生成頭像):seed(=skill id)→ 角色,
// 姿勢由 useSpritePose 管理(SkillCard 上有切換選單,全站同步)。
// 素材:src/assets/sprites/<char>/<pose>.gif(透明背景),正本在 ~/ui-asset-library。
const props = withDefaults(defineProps<{ seed: string; size?: number }>(), { size: 48 })

const char = computed(() => charForSeed(props.seed))
const pose = useSpritePose(props.seed)
const url = computed(() => spriteUrl(char.value, pose.value))
</script>

<template>
  <img
    v-if="url"
    :src="url"
    :width="size"
    :height="size"
    alt=""
    class="shrink-0 object-contain [image-rendering:pixelated]"
    :style="{ width: `${size}px`, height: `${size}px` }"
  />
</template>

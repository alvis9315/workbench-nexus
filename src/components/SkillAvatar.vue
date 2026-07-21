<script setup lang="ts">
import { computed } from 'vue'
import { activeTheme } from '@/themes'
import { useSpriteChar } from '@/composables/useSpriteChar'
import { useSpritePose } from '@/composables/useSpritePose'

// sprite 頭像(2026-07-21 起取代 DiceBear 生成頭像):seed(=skill id)→ 角色,
// 素材來源由 activeTheme 決定,姿勢由 useSpritePose 管理(SkillCard 上有切換選單,全站同步)。
// oversize 姿勢:佔位框維持 size 不動(版面不跳),圖依 poseScale 放大、底部對齊往上溢出——
// 下緣與小型角色齊平(不壓到名條),多出來的部分自然衝出卡片上方。
const props = withDefaults(defineProps<{ seed: string; size?: number }>(), { size: 48 })

const char = useSpriteChar(props.seed)
const pose = useSpritePose(props.seed)
const url = computed(() => activeTheme.value.spriteUrl(char.value, pose.value))
const scale = computed(() => activeTheme.value.poseScale(char.value, pose.value))
const drawSize = computed(() => Math.round(props.size * scale.value))
</script>

<template>
  <div class="relative shrink-0" :style="{ width: `${size}px`, height: `${size}px` }">
    <img
      v-if="url"
      :src="url"
      :width="drawSize"
      :height="drawSize"
      alt=""
      class="pointer-events-none object-contain [image-rendering:pixelated]"
      :class="scale > 1 ? 'absolute bottom-0 left-1/2 z-20 max-w-none -translate-x-1/2' : ''"
      :style="{ width: `${drawSize}px`, height: `${drawSize}px` }"
    />
  </div>
</template>

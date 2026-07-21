<script setup lang="ts">
import { computed } from 'vue'
import { activeTheme } from '@/themes'
import { useSpriteChar } from '@/composables/useSpriteChar'
import { useSpritePose } from '@/composables/useSpritePose'
import PixelSprite from '@/components/PixelSprite.vue'

// sprite 頭像:seed(=skill id)→ 角色,素材來源由 activeTheme 決定,
// 渲染一律走 PixelSprite(strip 主題逐格播放、gif 主題原樣 <img>)。
// oversize 姿勢:佔位框維持 size 不動(版面不跳),圖依 poseScale 放大溢出;
// 錨定方式由主題宣告(oversizeAnchor)——體型差主題貼底對齊,武器大格主題置中,元件不猜。
const props = withDefaults(defineProps<{ seed: string; size?: number }>(), { size: 48 })

const char = useSpriteChar(props.seed)
const pose = useSpritePose(props.seed)
const asset = computed(() => activeTheme.value.poseAsset(char.value, pose.value))
const scale = computed(() => activeTheme.value.poseScale(char.value, pose.value))
const drawSize = computed(() => Math.round(props.size * scale.value))
const oversizeCls = computed(() =>
  activeTheme.value.oversizeAnchor === 'bottom'
    ? 'absolute bottom-0 left-1/2 z-20 max-w-none -translate-x-1/2'
    : 'absolute left-1/2 top-1/2 z-20 max-w-none -translate-x-1/2 -translate-y-1/2',
)
</script>

<template>
  <div class="relative shrink-0" :style="{ width: `${size}px`, height: `${size}px` }">
    <PixelSprite
      v-if="asset"
      :asset="asset"
      :width="drawSize"
      class="pointer-events-none"
      :class="scale > 1 ? oversizeCls : ''"
    />
  </div>
</template>

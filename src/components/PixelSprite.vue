<script setup lang="ts">
import { computed } from 'vue'
import type { PoseAsset } from '@/themes/types'

// 姿勢素材統一渲染器(複製改造自 ui-asset-library custom/vue/PixelSprite,
// theme-mainline-v2 §3.3):strip → CSS steps() 逐格播放(可暫停、真透明、單次 decode);
// gif → <img>(寶可夢主題等自帶動畫的來源)。消費端只給 asset + 顯示尺寸,
// class/style 由 attrs 透傳到根節點(定位/錨定類名照舊寫在使用處)。
const props = withDefaults(
  defineProps<{ asset: PoseAsset; width: number; height?: number; playing?: boolean }>(),
  { playing: true },
)

const h = computed(() => props.height ?? props.width)
const stripStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${h.value}px`,
  backgroundImage: `url(${props.asset.url})`,
  backgroundSize: `${props.width * props.asset.frames}px ${h.value}px`,
  animationName: 'wn-strip-cycle',
  animationDuration: `${props.asset.frames * props.asset.frameMs}ms`,
  animationTimingFunction: `steps(${props.asset.frames})`,
  animationIterationCount: 'infinite',
  animationPlayState: props.playing ? 'running' : 'paused',
  '--strip-width': `${props.width * props.asset.frames}px`,
}))
</script>

<template>
  <div v-if="asset.kind === 'strip'" class="wn-pixel-sprite" :style="stripStyle" />
  <img
    v-else
    :src="asset.url"
    :width="width"
    :height="h"
    alt=""
    class="object-contain [image-rendering:pixelated]"
    :style="{ width: `${width}px`, height: `${h}px` }"
  />
</template>

<style>
.wn-pixel-sprite {
  image-rendering: pixelated;
  background-repeat: no-repeat;
  flex-shrink: 0;
}
@keyframes wn-strip-cycle {
  to {
    background-position: calc(var(--strip-width) * -1) 0;
  }
}
</style>

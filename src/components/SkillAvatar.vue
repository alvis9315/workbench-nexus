<script setup lang="ts">
import { computed } from 'vue'
import { createAvatar } from '@dicebear/core'
import { pixelArt } from '@dicebear/collection'

// DiceBear pixel-art 頭像:seed → 專屬且風格一致的像素角色(本地生成,零 HTTP)。
// 這顆只是「預設頭像供應商」——SkillCard/Dialog 的 avatar slot 換內容即可替換。
const props = withDefaults(defineProps<{ seed: string; size?: number }>(), { size: 48 })

// 女性化 preset(2026-07-20 擁有者定向:漂亮妹子形象,不要醜男/光頭):
// 髮型白名單只留 long 系、鬍子 0%、眼鏡低機率;要調形象改這組常數即可。
const FEMININE = {
  hair: Array.from({ length: 21 }, (_, i) => `long${String(i + 1).padStart(2, '0')}`),
  beardProbability: 0,
  glassesProbability: 10,
  accessoriesProbability: 25,
} as object

const uri = computed(() =>
  createAvatar(pixelArt, {
    seed: props.seed,
    size: props.size,
    backgroundColor: ['16305c'],
    ...FEMININE,
  }).toDataUri(),
)
</script>

<template>
  <img
    :src="uri"
    :width="size"
    :height="size"
    alt=""
    class="shrink-0 rounded-md border border-border [image-rendering:pixelated]"
  />
</template>

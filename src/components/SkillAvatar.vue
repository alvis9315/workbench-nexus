<script setup lang="ts">
import { computed } from 'vue'
import { createAvatar } from '@dicebear/core'
import { pixelArt } from '@dicebear/collection'

// DiceBear pixel-art 頭像:seed → 專屬且風格一致的像素角色(本地生成,零 HTTP)。
// 這顆只是「預設頭像供應商」——SkillCard/Dialog 的 avatar slot 換內容即可替換。
const props = withDefaults(defineProps<{ seed: string; size?: number }>(), { size: 48 })

const uri = computed(() =>
  createAvatar(pixelArt, { seed: props.seed, size: props.size, backgroundColor: ['2c2360'] }).toDataUri(),
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

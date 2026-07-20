<script lang="ts" setup>
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
  XIcon,
} from '@lucide/vue';


import type { ToasterProps } from "vue-sonner"
import { reactiveOmit } from "@vueuse/core"
import { Toaster as Sonner } from "vue-sonner"
import { cn } from "@/lib/utils"

const props = defineProps<ToasterProps>()
const delegatedProps = reactiveOmit(props, "class", "toastOptions")
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      /* 遊戲通知風(2026-07-20 擁有者定向):黃底更清楚+置頂更顯眼,取代原深色 popover 底;
         error 保留紅色系,避免失敗訊息也變黃底而混淆成功/失敗 */
      '--normal-bg': 'var(--primary)',
      '--normal-text': 'var(--primary-foreground)',
      '--normal-border': 'color-mix(in srgb, var(--primary) 55%, black)',
      '--success-bg': 'var(--primary)',
      '--success-text': 'var(--primary-foreground)',
      '--success-border': 'color-mix(in srgb, var(--primary) 55%, black)',
      '--error-bg': 'var(--destructive)',
      '--error-text': '#fff',
      '--error-border': 'color-mix(in srgb, var(--destructive) 55%, black)',
      '--border-radius': 'var(--radius)',
      '--gray2': 'hsl(var(--popover) / 0.9)',
      '--gray3': 'var(--border)',
      '--gray4': 'var(--border)',
      '--gray5': 'var(--border)',
      '--gray12': 'var(--popover-foreground)',
      '--width': '380px',
    }"
    :toast-options="props.toastOptions ?? {
      classes: {
        toast: 'rounded-md border-2 font-bold shadow-[0_4px_0_0_rgba(0,0,0,0.45)]',
      },
    }"
    v-bind="delegatedProps"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>

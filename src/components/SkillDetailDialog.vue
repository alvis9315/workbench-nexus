<script setup lang="ts">
import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { Copy } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { categoryLabel } from '@/data/categories'
import type { Skill } from '@/types'

// skill 詳情:用途、觸發關鍵字、調用 prompt + 複製鈕。
// 「發射台不是引擎」:主要動作 = 複製調用 prompt 去 Claude 貼上。
const props = defineProps<{ skill: Skill | null }>()
const emit = defineEmits<{ close: [] }>()

const open = computed({
  get: () => props.skill !== null,
  set: (v) => {
    if (!v) emit('close')
  },
})

const { copy } = useClipboard()
const copyInvocation = async () => {
  if (!props.skill) return
  try {
    await copy(props.skill.invocation)
    toast.success(`已複製「${props.skill.name}」的調用 prompt,去 Claude 貼上即可`)
  } catch {
    toast.error('複製失敗,請手動選取複製')
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent v-if="skill" class="pixel-frame max-w-lg">
      <DialogHeader>
        <div class="flex items-center gap-3">
          <slot name="avatar">
            <div class="flex size-12 items-center justify-center rounded-md bg-accent font-pixel text-lg text-primary">
              {{ skill.name.slice(0, 1) }}
            </div>
          </slot>
          <div>
            <DialogTitle class="text-base">{{ skill.name }}</DialogTitle>
            <Badge variant="secondary" class="mt-1 text-[10px]">{{ categoryLabel(skill.category) }}</Badge>
          </div>
        </div>
        <DialogDescription class="pt-2 text-left">{{ skill.description }}</DialogDescription>
      </DialogHeader>

      <div>
        <p class="mb-1.5 font-pixel text-[10px] text-muted-foreground">TRIGGERS</p>
        <div class="flex flex-wrap gap-1.5">
          <Badge v-for="k in skill.triggerKeywords" :key="k" variant="outline" class="text-xs">{{ k }}</Badge>
        </div>
      </div>

      <div>
        <p class="mb-1.5 font-pixel text-[10px] text-muted-foreground">INVOCATION</p>
        <div class="rounded-md border bg-background/60 p-3">
          <code class="block whitespace-pre-wrap break-all text-xs text-foreground">{{ skill.invocation }}</code>
        </div>
      </div>

      <Button class="w-full gap-2 font-bold" @click="copyInvocation">
        <Copy class="size-4" /> 複製調用 prompt
      </Button>
    </DialogContent>
  </Dialog>
</template>

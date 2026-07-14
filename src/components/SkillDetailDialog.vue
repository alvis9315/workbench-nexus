<script setup lang="ts">
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { Copy, Star } from 'lucide-vue-next'
import { launchSkill } from '@/lib/launcher'
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
import SkillAvatar from '@/components/SkillAvatar.vue'
import type { Skill } from '@/types'

// skill 詳情:用途、觸發關鍵字、調用 prompt + 複製鈕。
// 「發射台不是引擎」:主要動作 = 複製調用 prompt 去 Claude 貼上。
const props = defineProps<{ skill: Skill | null; pinned?: boolean }>()
const emit = defineEmits<{ close: []; togglePin: [] }>()

const open = computed({
  get: () => props.skill !== null,
  set: (v) => {
    if (!v) emit('close')
  },
})

const copyInvocation = async () => {
  if (props.skill) await launchSkill(props.skill)
}

// 私人筆記(EXT-004):每 skill 一則,localStorage,即打即存。
const notes = useLocalStorage<Record<string, string>>('wn-skill-notes', {})
const note = computed({
  get: () => (props.skill ? notes.value[props.skill.id] ?? '' : ''),
  set: (v) => {
    if (props.skill) notes.value = { ...notes.value, [props.skill.id]: v }
  },
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent v-if="skill" class="pixel-frame max-w-lg">
      <DialogHeader>
        <div class="flex items-center gap-3">
          <slot name="avatar">
            <SkillAvatar :seed="skill.seed" />
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

      <div>
        <p class="mb-1.5 font-pixel text-[10px] text-muted-foreground">NOTES</p>
        <textarea
          v-model="note"
          rows="2"
          placeholder="私人筆記(即打即存,只在本機)…"
          class="w-full resize-y rounded-md border border-border bg-background/60 p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div class="flex gap-2">
        <Button class="flex-1 gap-2 font-bold" @click="copyInvocation">
          <Copy class="size-4" /> 複製調用 prompt
        </Button>
        <Button
          variant="outline"
          class="gap-1.5"
          :class="pinned ? 'text-primary' : 'text-muted-foreground'"
          :title="pinned ? '取消釘選(移出 Hotbar)' : '釘選到 Hotbar'"
          @click="emit('togglePin')"
        >
          <Star class="size-4" :fill="pinned ? 'currentColor' : 'none'" />
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

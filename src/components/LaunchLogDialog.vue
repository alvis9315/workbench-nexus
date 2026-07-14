<script setup lang="ts">
import { computed } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { launchLog } from '@/lib/launcher'
import type { Skill } from '@/types'

// 使用紀錄(EXT-002):最近的發射(複製調用)清單。
const props = defineProps<{ open: boolean; skills: Skill[] }>()
const emit = defineEmits<{ 'update:open': [v: boolean] }>()

const model = computed({ get: () => props.open, set: (v) => emit('update:open', v) })
const nameOf = (id: string) => props.skills.find((s) => s.id === id)?.name ?? id
const fmt = (iso: string) =>
  new Date(iso).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
const clear = () => (launchLog.value = [])
</script>

<template>
  <Dialog v-model:open="model">
    <DialogContent class="pixel-frame max-w-md">
      <DialogHeader>
        <DialogTitle class="font-pixel text-sm">LAUNCH LOG</DialogTitle>
        <DialogDescription>最近的發射紀錄(複製調用),只存在本機。</DialogDescription>
      </DialogHeader>
      <p v-if="launchLog.length === 0" class="py-8 text-center text-sm text-muted-foreground">
        還沒有紀錄——去技能牆發射一次吧。
      </p>
      <ScrollArea v-else class="max-h-72">
        <div class="space-y-1 pr-3">
          <div
            v-for="(l, i) in launchLog"
            :key="i"
            class="flex items-center justify-between rounded-md bg-secondary/60 px-3 py-1.5 text-sm"
          >
            <span class="truncate font-medium">{{ nameOf(l.skillId) }}</span>
            <span class="shrink-0 text-xs text-muted-foreground">{{ fmt(l.at) }}</span>
          </div>
        </div>
      </ScrollArea>
      <Button v-if="launchLog.length" variant="outline" size="sm" @click="clear">清空紀錄</Button>
    </DialogContent>
  </Dialog>
</template>

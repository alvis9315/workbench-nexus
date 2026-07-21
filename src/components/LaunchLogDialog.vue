<script setup lang="ts">
import { computed } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { launchLog, usageRanking } from '@/lib/launcher'
import type { Skill } from '@/types'

// 使用紀錄(EXT-002):常用排行 Top 10 + 最近的發射(複製調用)清單。
const props = defineProps<{ open: boolean; skills: Skill[] }>()
const emit = defineEmits<{ 'update:open': [v: boolean] }>()

const model = computed({ get: () => props.open, set: (v) => emit('update:open', v) })
const nameOf = (id: string) => props.skills.find((s) => s.id === id)?.name ?? id

const ranking = computed(() => usageRanking().slice(0, 10))
const maxCount = computed(() => ranking.value[0]?.[1] ?? 1)
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
      <template v-else>
        <div>
          <p class="mb-1.5 font-pixel text-[10px] text-muted-foreground">常用排行 TOP 10</p>
          <div class="space-y-1">
            <div
              v-for="([id, count], i) in ranking"
              :key="id"
              class="relative flex items-center gap-2 overflow-hidden rounded-md bg-secondary/60 px-3 py-1 text-sm"
            >
              <!-- 次數比例條:墊在文字下,一眼看出相對熱度 -->
              <div
                class="absolute inset-y-0 left-0 bg-primary/10"
                :style="{ width: `${(count / maxCount) * 100}%` }"
              />
              <span class="z-10 w-5 shrink-0 font-pixel text-[9px] text-primary">{{ i + 1 }}</span>
              <span class="z-10 truncate font-medium">{{ nameOf(id) }}</span>
              <span class="z-10 ml-auto shrink-0 text-xs text-muted-foreground">×{{ count }}</span>
            </div>
          </div>
        </div>
        <p class="mb-1.5 mt-2 font-pixel text-[10px] text-muted-foreground">最近紀錄</p>
      </template>
      <ScrollArea v-if="launchLog.length" class="max-h-52">
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

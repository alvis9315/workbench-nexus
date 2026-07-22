<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, Plus, Search, Trash2, UsersRound, X } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import PixelSprite from '@/components/PixelSprite.vue'
import { activeTheme } from '@/themes'

defineProps<{ chars: string[]; limit: number }>()
const emit = defineEmits<{ add: [char: string]; remove: [char: string]; clear: [] }>()

const addOpen = ref(false)
const rosterOpen = ref(false)
const q = ref('')
const tab = ref('all')
const visibleCount = ref(60)

watch(addOpen, (open) => {
  if (open) {
    q.value = ''
    tab.value = 'all'
    visibleCount.value = 60
  }
})
watch([q, tab], () => { visibleCount.value = 60 })

const groups = computed(() =>
  activeTheme.value.groups.filter((group) =>
    activeTheme.value.chars.some((char) => activeTheme.value.charGroupOf(char) === group.id),
  ),
)
const shown = computed(() => {
  const query = q.value.trim().toLowerCase()
  return activeTheme.value.chars.filter((char) => {
    if (tab.value !== 'all' && activeTheme.value.charGroupOf(char) !== tab.value) return false
    return !query || `${char} ${activeTheme.value.charLabel(char)}`.toLowerCase().includes(query)
  })
})
const visibleChars = computed(() => shown.value.slice(0, visibleCount.value))
const addLabel = computed(() => activeTheme.value.id === 'pokemon' ? '加入寶可夢' : '加入角色')

const preview = (char: string) => {
  const frame = activeTheme.value.charFrame(char)
  const ratio = 52 / Math.max(frame.w, frame.h)
  return {
    asset: activeTheme.value.poseAsset(char, activeTheme.value.slotPose(char, 'idle')),
    width: Math.max(frame.w * ratio, 20),
    height: Math.max(frame.h * ratio, 20),
  }
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <Button variant="outline" size="sm" class="h-7 gap-1.5 px-2 text-[10px]" @click="addOpen = true">
      <Plus class="size-3" />{{ addLabel }}
    </Button>
    <Button variant="outline" size="sm" class="h-7 gap-1.5 px-2 text-[10px]" @click="rosterOpen = true">
      <UsersRound class="size-3" />娃娃清單 {{ chars.length }}/{{ limit }}
    </Button>
  </div>

  <Dialog v-model:open="addOpen">
    <DialogContent class="pixel-frame flex max-h-[620px] max-w-2xl flex-col sm:max-w-2xl">
      <DialogHeader class="shrink-0">
        <DialogTitle class="font-pixel text-sm">{{ addLabel }}</DialogTitle>
        <DialogDescription>
          {{ activeTheme.label }} · 已放入 {{ chars.length }}/{{ limit }}；同一角色只放一隻
        </DialogDescription>
      </DialogHeader>

      <div class="flex shrink-0 flex-wrap items-center gap-2">
        <ToggleGroup
          type="single"
          :model-value="tab"
          variant="outline"
          size="sm"
          class="flex-wrap justify-start"
          @update:model-value="(value) => (tab = (value as string) || 'all')"
        >
          <ToggleGroupItem value="all" class="font-pixel text-[10px]">全部</ToggleGroupItem>
          <ToggleGroupItem v-for="group in groups" :key="group.id" :value="group.id" class="text-xs">
            {{ group.label }}
          </ToggleGroupItem>
        </ToggleGroup>
        <div class="relative min-w-40 flex-1">
          <Search class="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input v-model="q" placeholder="搜尋角色…" class="h-8 pl-8 text-sm" />
        </div>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto pr-1">
        <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
          <button
            v-for="char in visibleChars"
            :key="char"
            type="button"
            class="relative flex min-h-24 flex-col items-center justify-center gap-1 rounded-md border p-2 transition-colors"
            :class="chars.includes(char) ? 'border-success/50 bg-success/10' : 'border-border hover:border-primary hover:bg-muted'"
            :disabled="chars.includes(char) || chars.length >= limit"
            :title="activeTheme.charLabel(char)"
            @click="emit('add', char)"
          >
            <Check v-if="chars.includes(char)" class="absolute right-1 top-1 size-3 text-success" />
            <PixelSprite
              v-if="preview(char).asset"
              :asset="preview(char).asset!"
              :width="preview(char).width"
              :height="preview(char).height"
              class="pointer-events-none"
            />
            <span class="w-full truncate text-center text-[10px] text-muted-foreground">
              {{ activeTheme.charLabel(char) }}
            </span>
          </button>
        </div>
        <div class="sticky bottom-0 mt-2 flex items-center justify-between border-t border-border bg-background/95 py-2 text-[10px] text-muted-foreground">
          <span>顯示 {{ visibleChars.length }}/{{ shown.length }}；一次最多載入 60 張預覽，避免圖鑑動畫拖慢介面。</span>
          <Button
            v-if="visibleChars.length < shown.length"
            variant="outline"
            size="sm"
            class="h-7 shrink-0 px-2 text-[10px]"
            @click="visibleCount += 60"
          >
            再載入 60 隻
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="rosterOpen">
    <DialogContent class="pixel-frame flex max-h-[560px] max-w-lg flex-col sm:max-w-lg">
      <DialogHeader class="shrink-0">
        <DialogTitle class="font-pixel text-sm">娃娃機目前角色</DialogTitle>
        <DialogDescription>這裡只顯示已加入的角色；按卡片右上角 × 可直接移除。</DialogDescription>
      </DialogHeader>

      <div class="flex items-center justify-between border-b border-border pb-2">
        <span class="text-xs text-muted-foreground">{{ activeTheme.label }} · {{ chars.length }}/{{ limit }}</span>
        <Button variant="destructive" size="sm" class="h-7 gap-1.5 px-2 text-[10px]" :disabled="!chars.length" @click="emit('clear')">
          <Trash2 class="size-3" />全部清空
        </Button>
      </div>

      <p v-if="!chars.length" class="py-12 text-center text-sm text-muted-foreground">娃娃機是空的，先加入角色或把技能卡拖進來。</p>
      <div v-else class="grid min-h-0 grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
        <div v-for="char in chars" :key="char" class="relative flex min-h-24 flex-col items-center justify-center gap-1 rounded-md border border-border bg-card p-2">
          <button
            type="button"
            class="absolute right-1 top-1 z-10 grid size-5 place-items-center rounded-full border border-border bg-background text-muted-foreground hover:border-destructive hover:text-destructive"
            :aria-label="`從娃娃機移除 ${activeTheme.charLabel(char)}`"
            @click="emit('remove', char)"
          >
            <X class="size-3" />
          </button>
          <PixelSprite
            v-if="preview(char).asset"
            :asset="preview(char).asset!"
            :width="preview(char).width"
            :height="preview(char).height"
            class="pointer-events-none"
          />
          <span class="w-full truncate text-center text-[10px] text-muted-foreground">{{ activeTheme.charLabel(char) }}</span>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

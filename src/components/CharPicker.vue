<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search, UserRound } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { activeTheme } from '@/themes'
import { useSpriteChar } from '@/composables/useSpriteChar'
import { useSpritePose } from '@/composables/useSpritePose'

// 角色選擇:貼圖選擇器式彈窗(通訊軟體選貼圖的形式)——上分類頁籤、搜尋框、
// 下面角色網格一目瞭然。分類由主題提供(公會=職業;寶可夢=世代)。
// 換角色時姿勢重設為新角色的預設(安全)姿勢——舊姿勢可能不存在或會裸素體。
const props = defineProps<{ seed: string; name?: string }>()

const open = ref(false)
const q = ref('')
const tab = ref('all')
const char = useSpriteChar(props.seed)
const pose = useSpritePose(props.seed)

// 只顯示有角色的分類;開窗時重置到「全部」與空搜尋
const groups = computed(() =>
  activeTheme.value.groups.filter((g) =>
    activeTheme.value.chars.some((c) => activeTheme.value.charGroupOf(c) === g.id),
  ),
)
watch(open, (v) => {
  if (v) {
    q.value = ''
    tab.value = 'all'
  }
})

const shown = computed(() => {
  const t = activeTheme.value
  const s = q.value.trim().toLowerCase()
  return t.chars.filter((c) => {
    if (tab.value !== 'all' && t.charGroupOf(c) !== tab.value) return false
    if (s && !`${c} ${t.charLabel(c)}`.toLowerCase().includes(s)) return false
    return true
  })
})

const pick = (c: string) => {
  char.value = c
  pose.value = activeTheme.value.defaultPoseOf(c)
  open.value = false
}
</script>

<template>
  <!-- 純 icon:六欄小卡塞不下文字 pill(會破版),名稱進 title/aria -->
  <button
    type="button"
    class="cursor-pointer rounded border border-border bg-background/80 px-1 py-0.5 text-muted-foreground hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
    :class="open ? 'border-primary text-primary' : ''"
    :aria-label="`切換 ${name ?? seed} 的角色(現在:${activeTheme.charLabel(char)})`"
    :title="`切換角色(現在:${activeTheme.charLabel(char)})`"
    @click.stop="open = true"
  >
    <UserRound class="size-2.5" />
  </button>

  <Dialog v-model:open="open">
    <DialogContent class="pixel-frame flex max-h-[560px] max-w-lg flex-col sm:max-w-lg">
      <DialogHeader class="shrink-0">
        <DialogTitle class="font-pixel text-sm">選擇角色</DialogTitle>
        <DialogDescription>
          {{ name ? `${name} · ` : '' }}{{ activeTheme.label }} · 共 {{ activeTheme.chars.length }} 隻
        </DialogDescription>
      </DialogHeader>

      <div class="flex shrink-0 flex-wrap items-center gap-2">
        <ToggleGroup
          type="single"
          :model-value="tab"
          variant="outline"
          size="sm"
          class="flex-wrap justify-start"
          @update:model-value="(v) => (tab = (v as string) || 'all')"
        >
          <ToggleGroupItem value="all" class="font-pixel text-[10px]">全部</ToggleGroupItem>
          <ToggleGroupItem v-for="g in groups" :key="g.id" :value="g.id" class="text-xs">
            {{ g.label }}
          </ToggleGroupItem>
        </ToggleGroup>
        <div class="relative min-w-36 flex-1">
          <Search class="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input v-model="q" placeholder="搜尋角色…" class="h-8 pl-8 text-sm" />
        </div>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto pr-1">
        <p v-if="!shown.length" class="py-10 text-center text-sm text-muted-foreground">沒有符合的角色</p>
        <div v-else class="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
          <button
            v-for="c in shown"
            :key="c"
            type="button"
            class="flex cursor-pointer flex-col items-center gap-1 rounded-md border p-2 transition-colors hover:border-primary hover:bg-muted"
            :class="c === char ? 'border-primary bg-muted' : 'border-transparent'"
            :title="activeTheme.charLabel(c)"
            @click="pick(c)"
          >
            <img
              :src="activeTheme.spriteUrl(c, activeTheme.defaultPoseOf(c))"
              width="48"
              height="48"
              loading="lazy"
              alt=""
              class="pointer-events-none size-12 object-contain object-bottom [image-rendering:pixelated]"
            />
            <span
              class="w-full truncate text-center text-[10px]"
              :class="c === char ? 'text-primary' : 'text-muted-foreground'"
            >
              {{ activeTheme.charLabel(c) }}
            </span>
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

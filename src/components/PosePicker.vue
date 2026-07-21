<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { charForSeed, posesOf } from '@/data/lpcSprites'
import { useSpritePose } from '@/composables/useSpritePose'

// 姿勢選擇器:比照 CommandPalette(⌘K)的搜尋式選單,取代原生 <select>
// (54-66 個選項的原生下拉會撐爆畫面)。CommandList 內建 max-h-72 滾動。
// 按動作分組(idle/walk/slash…),方向當項目,搜尋吃完整姿勢名。
const props = defineProps<{ seed: string; name?: string }>()

const open = ref(false)
const query = ref('')
const pose = useSpritePose(props.seed)

const pretty = (p: string) => p.replace(/_/g, ' ')

// "combat_idle_down" → 組=combat idle、項=down;無方向字尾的整名自成一組
const groups = computed(() => {
  const out = new Map<string, { pose: string; dir: string }[]>()
  for (const p of posesOf(charForSeed(props.seed))) {
    const m = p.match(/^(.+)_(down|left|right|up)$/)
    const action = m ? m[1] : p
    const dir = m ? m[2] : ''
    if (!out.has(action)) out.set(action, [])
    out.get(action)!.push({ pose: p, dir })
  }
  return out
})

const pick = (p: string) => {
  pose.value = p
  open.value = false
}
</script>

<template>
  <button
    type="button"
    class="cursor-pointer rounded border border-border bg-background/80 px-1 py-0.5 text-[8px] text-muted-foreground hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
    :aria-label="`切換 ${name ?? seed} 的姿勢`"
    @click.stop="open = true"
  >
    {{ pretty(pose) }} ▾
  </button>

  <CommandDialog
    v-model:open="open"
    :title="`切換姿勢${name ? ` — ${name}` : ''}`"
    description="搜尋或點選要顯示的姿勢"
  >
    <CommandInput v-model="query" placeholder="搜尋姿勢:idle、walk、slash…" />
    <CommandList>
      <CommandEmpty>沒有符合的姿勢</CommandEmpty>
      <CommandGroup v-for="[action, items] in groups" :key="action" :heading="pretty(action)">
        <CommandItem
          v-for="it in items"
          :key="it.pose"
          :value="pretty(it.pose)"
          @select="pick(it.pose)"
        >
          <span>{{ it.dir || pretty(it.pose) }}</span>
          <span v-if="it.pose === pose" class="ml-auto font-pixel text-[9px] text-primary">✓ 使用中</span>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>

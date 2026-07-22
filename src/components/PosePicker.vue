<script setup lang="ts">
import { computed, ref } from 'vue'
import { PersonStanding } from 'lucide-vue-next'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { activeTheme } from '@/themes'
import { useSpriteChar } from '@/composables/useSpriteChar'
import { useSpritePose } from '@/composables/useSpritePose'

// 姿勢選擇器:錨定在按鈕下方的可搜尋下拉(combobox),不是置中彈窗——
// 置中的 CommandDialog 語彙留給真正的全域搜尋(⌘K)。
// CommandList 內建 max-h-72 滾動,54-66 個選項不會撐爆畫面。
// 按動作分組(idle/walk/slash…),方向當項目,搜尋吃完整姿勢名。
const props = defineProps<{ seed: string; name?: string }>()

const open = ref(false)
const query = ref('')
const char = useSpriteChar(props.seed)
const pose = useSpritePose(props.seed)

const pretty = (p: string) => p.replace(/_/g, ' ')

// "combat_idle_down" → 組=combat idle、項=down;無方向字尾的整名自成一組
const groups = computed(() => {
  const out = new Map<string, { pose: string; dir: string }[]>()
  for (const p of activeTheme.value.posesOf(char.value)) {
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
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <!-- 純 icon:六欄小卡塞不下文字 pill(會破版),姿勢名進 title/aria -->
      <button
        type="button"
        class="cursor-pointer rounded border border-border bg-background/80 px-1 py-0.5 text-muted-foreground hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary data-[state=open]:border-primary data-[state=open]:text-primary"
        :aria-label="`切換 ${name ?? seed} 的姿勢(現在:${pretty(pose)})`"
        :title="`切換姿勢(現在:${pretty(pose)})`"
        @click.stop
      >
        <PersonStanding class="size-2.5" />
      </button>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        side="bottom"
        align="start"
        :side-offset="4"
        class="z-[3200] w-52 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md"
        @click.stop
      >
        <Command>
          <CommandInput v-model="query" placeholder="搜尋姿勢…" />
          <CommandList>
            <CommandEmpty>沒有符合的姿勢</CommandEmpty>
            <!-- 只有一個無方向項的組(如 weapon_oversize1_r7)不給 heading,
                 避免「標題+同名項目」重複兩行的怪顯示 -->
            <CommandGroup
              v-for="[action, items] in groups"
              :key="action"
              :heading="items.length === 1 && !items[0].dir ? undefined : pretty(action)"
            >
              <CommandItem
                v-for="it in items"
                :key="it.pose"
                :value="pretty(it.pose)"
                @select="pick(it.pose)"
              >
                <!-- 搜尋比對的是 textContent:sr-only 塞完整姿勢名,搜 walk 才對得到「walk down」 -->
                <span>{{ it.dir || pretty(it.pose) }}</span>
                <span v-if="it.dir" class="sr-only">{{ pretty(it.pose) }}</span>
                <span v-if="it.pose === pose" class="ml-auto font-pixel text-[9px] text-primary">✓ 使用中</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

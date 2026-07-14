<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMagicKeys, whenever } from '@vueuse/core'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { categoryLabel } from '@/data/categories'
import type { Skill } from '@/types'

// ⌘K palette:模糊搜尋 名稱/描述/triggerKeywords,Enter/點擊開啟該 skill。
const props = defineProps<{ skills: Skill[] }>()
const emit = defineEmits<{ pick: [id: string] }>()

const open = ref(false)
const { Meta_K, Ctrl_K } = useMagicKeys({
  passive: false,
  onEventFired: (e) => {
    if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) e.preventDefault()
  },
})
whenever(Meta_K, () => (open.value = true))
whenever(Ctrl_K, () => (open.value = true))

const query = ref('')
watch(open, (o) => {
  if (!o) query.value = ''
})

// Command 元件內建過濾吃 item 的 value 字串:把可搜尋欄位串起來餵給它。
const haystack = (s: Skill) =>
  [s.name, s.description, ...s.triggerKeywords].join(' ')

const pick = (id: string) => {
  emit('pick', id)
  open.value = false
}

defineExpose({ open })
</script>

<template>
  <CommandDialog v-model:open="open" title="搜尋技能" description="輸入名稱、用途或觸發關鍵字">
    <CommandInput v-model="query" placeholder="搜尋技能:名稱、用途、觸發關鍵字…" />
    <CommandList>
      <CommandEmpty>找不到符合的技能,換個關鍵字試試</CommandEmpty>
      <CommandGroup heading="技能">
        <CommandItem
          v-for="s in props.skills"
          :key="s.id"
          :value="haystack(s)"
          @select="pick(s.id)"
        >
          <span class="font-medium">{{ s.name }}</span>
          <span class="ml-2 truncate text-xs text-muted-foreground">{{ s.description }}</span>
          <span class="ml-auto text-[10px] text-muted-foreground">{{ categoryLabel(s.category) }}</span>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>

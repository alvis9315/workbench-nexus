<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, Palette, Search } from 'lucide-vue-next'
import { PopoverContent, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { THEME_META, themeId, activeTheme } from '@/themes'

// 主題切換:換一個角色素材來源,全站(卡片/Hotbar/小幫手/彈窗)即時換裝。
// 各主題的角色/姿勢偏好各自記憶(localStorage 分 key),切回來不會丟。
// 主題會愈來愈多:清單附代表角色小圖+搜尋框,不讓下拉無限長。
const open = ref(false)
const q = ref('')
watch(open, (v) => {
  if (v) q.value = ''
})

const shown = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return THEME_META
  return THEME_META.filter((t) => `${t.id} ${t.label}`.toLowerCase().includes(s))
})

const pick = (id: string) => {
  themeId.value = id
  open.value = false
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        size="icon"
        class="text-muted-foreground data-[state=open]:border-primary data-[state=open]:text-primary"
        :title="`主題:${activeTheme.label}`"
      >
        <Palette class="size-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      side="bottom"
      align="end"
      :side-offset="4"
      class="z-50 w-56 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
    >
      <div class="relative mb-1">
        <Search class="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="q" placeholder="搜尋主題…" class="h-7 pl-7 text-xs" />
      </div>
      <div class="max-h-64 space-y-0.5 overflow-y-auto">
        <p v-if="!shown.length" class="px-2 py-3 text-center text-xs text-muted-foreground">沒有符合的主題</p>
        <button
          v-for="t in shown"
          :key="t.id"
          type="button"
          class="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground hover:bg-muted hover:text-primary"
          @click="pick(t.id)"
        >
          <img
            :src="t.icon"
            width="20"
            height="20"
            alt=""
            class="pointer-events-none size-5 shrink-0 object-contain object-bottom [image-rendering:pixelated]"
          />
          <span class="truncate">{{ t.label }}</span>
          <Check v-if="t.id === themeId" class="ml-auto size-3.5 shrink-0 text-primary" />
        </button>
      </div>
    </PopoverContent>
  </PopoverRoot>
</template>

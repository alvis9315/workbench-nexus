<script setup lang="ts">
import { Check, Paintbrush } from 'lucide-vue-next'
import { PopoverContent, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { Button } from '@/components/ui/button'
import { SHELL_THEMES, shellThemeId, type ShellThemeId } from '@/shell-themes'

const pick = (id: ShellThemeId) => {
  shellThemeId.value = id
}
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="gap-1.5 text-muted-foreground" title="切換工作站背景配色">
        <Paintbrush class="size-4" />
        <span class="hidden sm:inline">配色</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent
      side="bottom"
      align="start"
      :side-offset="6"
      class="z-[3300] w-64 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
    >
      <p class="px-2 pb-1 pt-1 font-pixel text-[8px] text-muted-foreground">BACKGROUND THEME</p>
      <button
        v-for="theme in SHELL_THEMES"
        :key="theme.id"
        type="button"
        class="flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-muted"
        @click="pick(theme.id)"
      >
        <span class="flex overflow-hidden rounded border border-border">
          <span v-for="color in theme.colors" :key="color" class="size-4" :style="{ background: color }" />
        </span>
        <span class="min-w-0">
          <span class="block font-pixel text-[8px] text-foreground">{{ theme.label }}</span>
          <span class="mt-1 block text-[10px] text-muted-foreground">{{ theme.description }}</span>
        </span>
        <Check v-if="theme.id === shellThemeId" class="ml-auto size-3.5 shrink-0 text-primary" />
      </button>
    </PopoverContent>
  </PopoverRoot>
</template>

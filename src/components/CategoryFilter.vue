<script setup lang="ts">
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CATEGORIES } from '@/data/categories'
import type { SkillCategory } from '@/types'

// 分類 chips(單選;'all' = 不篩)。選項從設定資料迭代,零硬編碼。
const model = defineModel<SkillCategory | 'all'>({ default: 'all' })

// ToggleGroup 允許取消選取(回傳 undefined/空)→ 一律折回 'all'
const onUpdate = (v: unknown) => {
  model.value = (v as SkillCategory | 'all') || 'all'
}
</script>

<template>
  <ToggleGroup
    type="single"
    :model-value="model"
    variant="outline"
    class="flex-wrap justify-start"
    @update:model-value="onUpdate"
  >
    <ToggleGroupItem value="all" class="font-pixel text-[10px]">全部</ToggleGroupItem>
    <ToggleGroupItem v-for="c in CATEGORIES" :key="c.value" :value="c.value" class="text-xs">
      {{ c.label }}
    </ToggleGroupItem>
  </ToggleGroup>
</template>

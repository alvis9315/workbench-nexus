<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { Search, History } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import SkillCard from '@/components/SkillCard.vue'
import CategoryFilter from '@/components/CategoryFilter.vue'
import CommandPalette from '@/components/CommandPalette.vue'
import SkillDetailDialog from '@/components/SkillDetailDialog.vue'
import Mascot from '@/components/Mascot.vue'
import Hotbar from '@/components/Hotbar.vue'
import LaunchLogDialog from '@/components/LaunchLogDialog.vue'
import { usePins } from '@/composables/usePins'
import skillsData from '@/data/skills.json'
import type { Skill, SkillCategory } from '@/types'

// 主頁 = 選角室:⌘K 搜尋 + 分類 chips + 技能牆 grid。
const skills = skillsData as Skill[]
const { pinned, isPinned, togglePin } = usePins(skills)
const logOpen = ref(false)
const activeCategory = ref<SkillCategory | 'all'>('all')
const filtered = computed(() =>
  activeCategory.value === 'all' ? skills : skills.filter((s) => s.category === activeCategory.value),
)

const palette = useTemplateRef('palette')
const openSkillId = ref<string | null>(null)
const openSkill = (id: string) => {
  openSkillId.value = id
}
const activeSkill = computed(() => skills.find((s) => s.id === openSkillId.value) ?? null)
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-10">
    <header class="mb-6 flex items-center justify-between gap-4">
      <h1 class="font-pixel text-lg text-primary sm:text-xl">WORKBENCH NEXUS</h1>
      <div class="flex items-center gap-2">
      <Button variant="outline" size="icon" class="text-muted-foreground" title="使用紀錄" @click="logOpen = true">
        <History class="size-4" />
      </Button>
      <Button variant="outline" class="gap-2 text-muted-foreground" @click="palette && (palette.open = true)">
        <Search class="size-4" />
        <span class="text-xs">搜尋技能</span>
        <Kbd class="ml-1">⌘K</Kbd>
      </Button>
      </div>
    </header>

    <Hotbar :pinned="pinned" />

    <CategoryFilter v-model="activeCategory" class="mb-6" />

    <div v-if="filtered.length" class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      <SkillCard v-for="s in filtered" :key="s.id" :skill="s" @open="openSkill" />
    </div>
    <Empty v-else class="py-16">
      <EmptyHeader>
        <EmptyTitle class="font-pixel text-sm">NO SKILLS</EmptyTitle>
        <EmptyDescription>這個分類還沒有技能——去 skills.json 加一行就會出現。</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <CommandPalette ref="palette" :skills="skills" @pick="openSkill" />
    <SkillDetailDialog
      :skill="activeSkill"
      :pinned="activeSkill ? isPinned(activeSkill) : false"
      @close="openSkillId = null"
      @toggle-pin="activeSkill && togglePin(activeSkill)"
    />
    <LaunchLogDialog v-model:open="logOpen" :skills="skills" />
    <Mascot />
  </main>
</template>

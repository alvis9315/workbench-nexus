<script setup lang="ts">
import { ref } from 'vue'
import SkillCard from '@/components/SkillCard.vue'
import skillsData from '@/data/skills.json'
import type { Skill } from '@/types'

// 主頁 = 選角室:技能牆 grid。filter 與 ⌘K 在 #3 接上。
const skills = skillsData as Skill[]
const openSkillId = ref<string | null>(null)
const openSkill = (id: string) => {
  openSkillId.value = id // #4 詳情 Dialog 接手
}
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-10">
    <header class="mb-8 flex items-center justify-between">
      <h1 class="font-pixel text-xl text-primary">WORKBENCH NEXUS</h1>
    </header>

    <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      <SkillCard v-for="s in skills" :key="s.id" :skill="s" @open="openSkill" />
    </div>
  </main>
</template>

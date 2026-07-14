<script setup lang="ts">
// 主頁:技能牆(佔位版,#2 任務會換成 SkillCard grid)。
import skills from '@/data/skills.json'
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-10">
    <header class="mb-8 flex items-center justify-between">
      <h1 class="font-pixel text-xl text-primary">WORKBENCH NEXUS</h1>
    </header>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      <div v-for="s in skills" :key="s.id" class="pixel-frame rounded-lg bg-card p-4">
        <p class="text-sm font-medium text-card-foreground">{{ s.name }}</p>
        <p class="mt-1 text-xs text-muted-foreground">{{ s.description }}</p>
      </div>
    </div>
  </main>
</template>

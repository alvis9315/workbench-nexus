<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

// 分區分頁(比照本機目錄:~/Skill、~/Projects、repos、~/ui-asset-library)。
// control center 只做「找到並出發」:技能=複製調用句,其餘=跳轉連結。
const TABS = [
  { name: 'home', to: '/', label: 'SKILLS', hint: '選角' },
  { name: 'projects', to: '/projects', label: 'PROJECTS', hint: '關卡選擇' },
  { name: 'repos', to: '/repos', label: 'REPOS', hint: '武器選單' },
  { name: 'uilibrary', to: '/uilibrary', label: 'UI LIB', hint: '素材庫' },
]

const route = useRoute()
const isActive = (name: string) => route.name === name
</script>

<template>
  <nav class="mb-6 flex flex-wrap gap-1.5" aria-label="分區切換">
    <RouterLink v-for="t in TABS" :key="t.name" :to="t.to">
      <span
        class="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-pixel text-[10px] transition-colors"
        :class="
          isActive(t.name)
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground'
        "
      >
        {{ t.label }}
        <span class="text-[9px] opacity-70">{{ t.hint }}</span>
      </span>
    </RouterLink>
  </nav>
</template>

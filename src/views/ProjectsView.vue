<script setup lang="ts">
import { ExternalLink, GitBranch, Lock, Play } from 'lucide-vue-next'
import NavTabs from '@/components/NavTabs.vue'
import projectsData from '@/data/projects.json'
import type { Project } from '@/types'

// Stage Select(洛克人關卡選擇):~/Projects 下有頁面的系統,一系統一關卡磚。
// 有 deployUrl → 可出發;null → LOCKED 等擁有者補連結(projects.json 補一行即解鎖)。
const projects = projectsData as Project[]

const isLocal = (url: string | null) => !!url && /localhost|127\.0\.0\.1/.test(url)
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-10">
    <NavTabs />
    <h1 class="mb-1 font-pixel text-lg text-primary">STAGE SELECT</h1>
    <p class="mb-6 text-xs text-muted-foreground">
      ~/Projects 下有頁面的系統;點擊出發。LOCKED = 部署連結待補(projects.json 補 deployUrl 即解鎖)
    </p>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <component
        :is="p.deployUrl ? 'a' : 'div'"
        v-for="p in projects"
        :key="p.name"
        :href="p.deployUrl ?? undefined"
        :target="p.deployUrl ? '_blank' : undefined"
        rel="noreferrer"
        class="pixel-frame group relative flex aspect-[4/3] flex-col justify-between rounded-lg bg-card p-4"
        :class="p.deployUrl ? 'pixel-frame-interactive cursor-pointer' : 'opacity-70'"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="font-pixel text-[11px] leading-relaxed text-card-foreground">{{ p.name }}</p>
          <span
            v-if="!p.deployUrl"
            class="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-pixel text-[9px] text-muted-foreground"
          >
            <Lock class="size-2.5" /> LOCKED
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1 rounded bg-success/15 px-1.5 py-0.5 font-pixel text-[9px] text-success"
          >
            <Play class="size-2.5" /> {{ isLocal(p.deployUrl) ? 'LOCAL' : 'READY' }}
          </span>
        </div>

        <p class="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{{ p.description }}</p>

        <div class="flex items-center justify-between gap-2">
          <p class="truncate text-[10px] text-muted-foreground/70">
            {{ p.deployUrl ?? (p.devHint ?? '等待部署連結…') }}
          </p>
          <div class="flex shrink-0 items-center gap-1">
            <a
              v-if="p.repoUrl"
              :href="p.repoUrl"
              target="_blank"
              rel="noreferrer"
              class="rounded-md p-1 text-muted-foreground hover:text-foreground"
              title="GitHub repo"
              @click.stop
            >
              <GitBranch class="size-3.5" />
            </a>
            <ExternalLink v-if="p.deployUrl" class="size-3.5 text-muted-foreground group-hover:text-primary" />
          </div>
        </div>
      </component>
    </div>
  </main>
</template>

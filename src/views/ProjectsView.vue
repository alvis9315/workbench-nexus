<script setup lang="ts">
import { ExternalLink, GitBranch, Lock } from 'lucide-vue-next'
import projectsData from '@/data/projects.json'
import type { Project } from '@/types'

// Stage Select(洛克人選關):STAGE 編號 + 中央徽記 + 斜切名牌 + 四角游標閃爍。
// 遊戲語彙 class(stage-cursor/game-plate/game-scanlines)定義在 main.css,手法移植自 figureshot-lab。
// 有 deployUrl → 可出發;null → LOCKED 等擁有者補連結(projects.json 補一行即解鎖)。
const projects = projectsData as Project[]

const stageNo = (i: number) => String(i + 1).padStart(2, '0')
const emblem = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 pb-10">
    <h1 class="mb-1 font-pixel text-lg text-primary">STAGE SELECT</h1>
    <p class="mb-6 text-xs text-muted-foreground">
      ~/Projects 下有頁面的系統;點擊出發。LOCKED = 部署連結待補(projects.json 補 deployUrl 即解鎖)
    </p>

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <component
        :is="p.deployUrl ? 'a' : 'div'"
        v-for="(p, i) in projects"
        :key="p.name"
        :href="p.deployUrl ?? undefined"
        :target="p.deployUrl ? '_blank' : undefined"
        rel="noreferrer"
        class="pixel-frame group relative flex flex-col overflow-hidden rounded-lg bg-card"
        :class="p.deployUrl ? 'stage-cursor cursor-pointer transition-transform hover:-translate-y-1' : 'opacity-60 grayscale-[0.4]'"
      >
        <div class="flex items-center justify-between px-3 pt-2.5">
          <span class="font-pixel text-[9px] text-muted-foreground">STAGE {{ stageNo(i) }}</span>
          <span
            v-if="!p.deployUrl"
            class="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-pixel text-[9px] text-muted-foreground"
          >
            <Lock class="size-2.5" /> LOCKED
          </span>
          <span v-else class="rounded bg-success/15 px-1.5 py-0.5 font-pixel text-[9px] text-success">READY</span>
        </div>

        <div class="game-scanlines mx-3 mt-2.5 flex h-28 items-center justify-center rounded-md border border-border bg-accent/40">
          <Lock v-if="!p.deployUrl" class="size-8 text-muted-foreground/60" />
          <span
            v-else
            class="font-pixel text-3xl text-primary/70 transition-all group-hover:scale-110 group-hover:text-primary"
            style="text-shadow: 0 0 18px color-mix(in srgb, var(--primary) 45%, transparent)"
          >
            {{ emblem(p.name) }}
          </span>
        </div>

        <div
          class="game-plate mx-3 mt-2.5 bg-accent px-4 py-1.5 text-center transition-colors group-hover:bg-primary"
        >
          <p class="truncate font-pixel text-[10px] text-accent-foreground transition-colors group-hover:text-primary-foreground">
            {{ p.name }}
          </p>
        </div>

        <p class="line-clamp-2 px-3.5 pt-2 text-xs leading-relaxed text-muted-foreground">{{ p.description }}</p>

        <div class="mt-auto flex items-center justify-between gap-2 px-3 pb-2.5 pt-2">
          <p class="truncate text-[10px] text-muted-foreground/70">
            {{ p.deployUrl ?? '等待部署連結…' }}
          </p>
          <div class="flex shrink-0 items-center gap-1.5">
            <a
              v-if="p.repoUrl"
              :href="p.repoUrl"
              target="_blank"
              rel="noreferrer"
              class="rounded-md border border-transparent p-1.5 text-muted-foreground transition-all hover:scale-110 hover:border-primary hover:bg-primary/15 hover:text-primary"
              title="開啟 GitHub repo"
              @click.stop
            >
              <GitBranch class="size-4" />
            </a>
            <span
              v-if="p.deployUrl"
              class="rounded-md border border-transparent p-1.5 text-muted-foreground transition-all group-hover:border-primary group-hover:bg-primary/15 group-hover:text-primary"
              title="前往頁面"
            >
              <ExternalLink class="size-4" />
            </span>
          </div>
        </div>
      </component>
    </div>
  </main>
</template>

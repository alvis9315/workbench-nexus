<script setup lang="ts">
import { Copy, ExternalLink, GitBranch, Lock, Terminal } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import projectsData from '@/data/projects.json'
import type { Project } from '@/types'

// Stage Select(洛克人選關):STAGE 編號 + 中央徽記 + 斜切名牌 + 四角游標閃爍。
// 遊戲語彙 class(stage-cursor/game-plate/game-scanlines)定義在 main.css,手法移植自 figureshot-lab。
//
// 三態:
// - deployUrl 有值 → READY,點擊跳轉
// - deployUrl 為 null 但 startCommand 有值 → LOCAL,點擊複製啟動指令(貼終端機自己開)。
//   本機限定工具(如即時打外部 API 的後端)無法部署,也不貼假 localhost 連結——
//   同一個 port 當下可能是別的專案在跑,連結會連錯;啟動指令永遠對,因為是你當下主動起這個專案。
// - 皆無 → LOCKED,等擁有者補(projects.json 補 deployUrl 或 startCommand 即解鎖)。
const projects = projectsData as Project[]

const stageNo = (i: number) => String(i + 1).padStart(2, '0')
const emblem = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const copyStartCommand = async (p: Project) => {
  if (!p.startCommand?.length) return
  try {
    await navigator.clipboard.writeText(p.startCommand.join('\n'))
    toast.success(`已複製「${p.name}」啟動指令,貼到終端機執行(${p.startCommand.length} 個 terminal)`)
  } catch {
    toast.error('複製失敗,請手動選取複製')
  }
}
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 pb-10">
    <h1 class="mb-1 font-pixel text-lg text-primary">STAGE SELECT</h1>
    <p class="mb-6 text-xs text-muted-foreground">
      ~/Projects 下有頁面的系統;READY 點擊出發,LOCAL 點擊複製啟動指令。LOCKED = 待補(projects.json 補一行即解鎖)
    </p>

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <component
        :is="p.deployUrl ? 'a' : p.startCommand?.length ? 'button' : 'div'"
        v-for="(p, i) in projects"
        :key="p.name"
        :type="!p.deployUrl && p.startCommand?.length ? 'button' : undefined"
        :href="p.deployUrl ?? undefined"
        :target="p.deployUrl ? '_blank' : undefined"
        rel="noreferrer"
        class="pixel-frame group relative flex flex-col overflow-hidden rounded-lg bg-card text-left"
        :class="
          p.deployUrl || p.startCommand?.length
            ? 'stage-cursor cursor-pointer transition-transform hover:-translate-y-1'
            : 'opacity-60 grayscale-[0.4]'
        "
        @click="!p.deployUrl && p.startCommand?.length ? copyStartCommand(p) : undefined"
      >
        <div class="flex items-center justify-between px-3 pt-2.5">
          <span class="font-pixel text-[9px] text-muted-foreground">STAGE {{ stageNo(i) }}</span>
          <span
            v-if="p.deployUrl"
            class="rounded bg-success/15 px-1.5 py-0.5 font-pixel text-[9px] text-success"
          >
            READY
          </span>
          <span
            v-else-if="p.startCommand?.length"
            class="inline-flex items-center gap-1 rounded bg-chart-3/15 px-1.5 py-0.5 font-pixel text-[9px] text-chart-3"
          >
            <Terminal class="size-2.5" /> LOCAL
          </span>
          <span v-else class="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-pixel text-[9px] text-muted-foreground">
            <Lock class="size-2.5" /> LOCKED
          </span>
        </div>

        <div class="game-scanlines mx-3 mt-2.5 flex h-28 items-center justify-center rounded-md border border-border bg-accent/40">
          <Lock v-if="!p.deployUrl && !p.startCommand?.length" class="size-8 text-muted-foreground/60" />
          <Terminal v-else-if="!p.deployUrl" class="size-8 text-chart-3/70 transition-all group-hover:scale-110 group-hover:text-chart-3" />
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
            {{ p.deployUrl ?? (p.startCommand?.length ? '點擊複製啟動指令…' : '等待部署連結…') }}
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
            <ExternalLink v-if="p.deployUrl" class="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            <Copy v-else-if="p.startCommand?.length" class="size-4 shrink-0 text-muted-foreground group-hover:text-chart-3" />
          </div>
        </div>
      </component>
    </div>
  </main>
</template>

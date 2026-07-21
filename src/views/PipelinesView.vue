<script setup lang="ts">
import { ArrowDown, ArrowRight, Copy, ExternalLink, Workflow } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import pipelinesData from '@/data/pipelines.json'
import type { Pipeline, PipelineStation } from '@/types'

// 管線視圖:README Skill Map 管線表的頁面版。正本是 specs/ 的契約文件,
// 這頁只做「看站點狀態 + 複製調用句」——發射台不是引擎,不在這裡執行任何站。
// 站點卡橫排(md 以上)/ 直排(窄幅),箭頭方向跟著換;新增管線 = pipelines.json 加一筆。
const pipelines = pipelinesData as Pipeline[]

const STATUS_META: Record<PipelineStation['status'], { label: string; cls: string }> = {
  ready: { label: 'READY', cls: 'bg-success/20 text-success' },
  wip: { label: 'WIP', cls: 'bg-warning/20 text-warning' },
  planned: { label: 'PLANNED', cls: 'bg-muted text-muted-foreground' },
}

const copyInvocation = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('SKILL SET!已複製調用句,貼到 Claude Code / 終端機發射')
  } catch {
    toast.error('複製失敗,請手動選取複製')
  }
}
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 pb-10">
    <h1 class="mb-1 font-pixel text-lg text-primary">PIPELINES</h1>
    <p class="mb-6 text-xs text-muted-foreground">跨 skill 管線的站點狀態與調用句;契約正本在 specs/,這頁只看與複製</p>

    <section v-for="p in pipelines" :key="p.slug" class="mb-8">
      <div class="mb-1 flex flex-wrap items-center gap-2">
        <Workflow class="size-4 text-primary" />
        <h2 class="font-pixel text-sm text-foreground">{{ p.name }}</h2>
        <a
          :href="p.contractUrl"
          target="_blank"
          rel="noreferrer"
          class="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary"
        >
          <ExternalLink class="size-3" /> 契約
        </a>
      </div>
      <p class="mb-1 text-xs text-muted-foreground">{{ p.description }}</p>
      <p class="mb-4 text-[10px] text-muted-foreground/70">{{ p.statusNote }}</p>

      <div class="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        <template v-for="(s, i) in p.stations" :key="s.name">
          <div v-if="i > 0" class="flex shrink-0 items-center justify-center text-primary">
            <ArrowRight class="hidden size-4 md:block" />
            <ArrowDown class="size-4 md:hidden" />
          </div>

          <div class="pixel-frame flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg bg-card p-3">
            <div class="flex items-center gap-1.5">
              <span class="font-pixel text-[9px] text-muted-foreground">ST.{{ i + 1 }}</span>
              <p class="truncate text-sm font-bold">{{ s.name }}</p>
              <span class="ml-auto shrink-0 rounded px-1 py-0.5 font-pixel text-[8px]" :class="STATUS_META[s.status].cls">
                {{ STATUS_META[s.status].label }}
              </span>
            </div>
            <Badge variant="outline" class="w-fit px-1.5 py-0 font-mono text-[10px]">{{ s.tool }}</Badge>
            <p class="text-xs leading-relaxed text-muted-foreground">{{ s.role }}</p>
            <p class="text-[10px] leading-relaxed text-muted-foreground/70">交接:{{ s.handoff }}</p>
            <button
              v-if="s.invocation"
              type="button"
              class="mt-auto flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2 py-1 text-left text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              :aria-label="`複製 ${s.name} 調用句`"
              @click="copyInvocation(s.invocation)"
            >
              <Copy class="size-3 shrink-0" />
              <code class="truncate font-mono">{{ s.invocation }}</code>
            </button>
          </div>
        </template>
      </div>
    </section>
  </main>
</template>

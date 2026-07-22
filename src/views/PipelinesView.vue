<script setup lang="ts">
import { ArrowDown, CheckCircle2, Copy, ExternalLink, FileText, MousePointerClick, Sparkles, Workflow } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import pipelinesData from '@/data/pipelines.json'
import templatesData from '@/data/resume-templates.json'
import type { Pipeline, PipelineStation, ResumeTemplate } from '@/types'

const pipelines = pipelinesData as Pipeline[]
const templates = templatesData as ResumeTemplate[]

const STATUS_META: Record<PipelineStation['status'], { label: string; explanation: string; cls: string }> = {
  ready: { label: '現在可用', explanation: '這一步現在就能做', cls: 'bg-success/20 text-success' },
  wip: { label: '部分可用', explanation: '內容可產出，仍有手動步驟', cls: 'bg-warning/20 text-warning' },
  planned: { label: '建置中', explanation: '先依畫面指示手動完成', cls: 'bg-muted text-muted-foreground' },
}

const copyText = async (text: string, message: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(message)
  } catch {
    toast.error('複製失敗，請手動選取文字')
  }
}
const copyInvocation = (text: string) => copyText(text, '已複製。貼到 Codex／Claude Code 後，再補上職缺網址或 JD。')
const chooseTemplate = (template: ResumeTemplate) => copyText(
  `履歷輸出版型請使用 ${template.slug}（${template.name}）`,
  `已選擇 ${template.name}，把這句貼到履歷製作對話即可。`,
)
const scrollToTemplates = () => document.querySelector('#templates')?.scrollIntoView({ behavior: 'smooth' })
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 pb-12">
    <div class="mb-7">
      <h1 class="mb-2 font-pixel text-lg text-primary">CAREER WORKSHOP</h1>
      <p class="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        這裡不是兩套不同工具，而是同一條履歷流程：先選職缺、再客製內容、最後選版型輸出。
        你只要依序完成下面三件事。
      </p>
    </div>

    <section class="mb-9">
      <h2 class="mb-3 font-pixel text-xs text-foreground">最快使用方式</h2>
      <div class="grid gap-3 md:grid-cols-3">
        <div class="pixel-frame flex min-h-40 flex-col rounded-lg bg-card p-4">
          <div class="mb-3 flex items-center gap-2"><span class="step-number">1</span><MousePointerClick class="size-4 text-primary" /></div>
          <h3 class="mb-2 font-bold">複製一則想投的職缺</h3>
          <p class="text-xs leading-relaxed text-muted-foreground">從 104、Cake 或公司官網複製網址；讀不到網頁時，改貼完整職缺文字。</p>
          <p class="mt-auto pt-3 text-[10px] text-muted-foreground/70">你要準備：職缺網址或 JD 全文</p>
        </div>
        <div class="pixel-frame flex min-h-40 flex-col rounded-lg bg-card p-4">
          <div class="mb-3 flex items-center gap-2"><span class="step-number">2</span><Sparkles class="size-4 text-primary" /></div>
          <h3 class="mb-2 font-bold">請 AI 針對職缺改履歷</h3>
          <p class="text-xs leading-relaxed text-muted-foreground">按下方第二站的「複製啟動句」，貼到 Codex／Claude Code，再接上職缺資料。</p>
          <p class="mt-auto pt-3 text-[10px] text-muted-foreground/70">你會拿到：兩份可校對的履歷內容</p>
        </div>
        <div class="pixel-frame flex min-h-40 flex-col rounded-lg bg-card p-4">
          <div class="mb-3 flex items-center gap-2"><span class="step-number">3</span><FileText class="size-4 text-primary" /></div>
          <h3 class="mb-2 font-bold">挑版型並確認 DOCX</h3>
          <p class="text-xs leading-relaxed text-muted-foreground">內容確認後選中文版或 ATS 英文版；自動輸出尚在建置，目前會提供手動指令。</p>
          <Button variant="outline" size="sm" class="mt-auto h-8 w-fit text-xs" @click="scrollToTemplates">看兩種版型</Button>
        </div>
      </div>
    </section>

    <section v-for="pipeline in pipelines" :key="pipeline.slug" class="mb-10">
      <div class="mb-3 rounded-lg border border-border bg-card/60 p-4">
        <div class="mb-2 flex flex-wrap items-center gap-2">
          <Workflow class="size-4 text-primary" />
          <h2 class="font-pixel text-sm text-foreground">{{ pipeline.name }}</h2>
          <a :href="pipeline.contractUrl" target="_blank" rel="noreferrer" class="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary">
            <ExternalLink class="size-3" />進階技術規格
          </a>
        </div>
        <p class="text-xs leading-relaxed text-muted-foreground">{{ pipeline.description }}</p>
        <p class="mt-2 text-[10px] leading-relaxed text-warning">目前狀態：{{ pipeline.statusNote }}</p>
      </div>

      <div class="grid items-stretch gap-3 md:grid-cols-3">
        <article v-for="(station, index) in pipeline.stations" :key="station.name" class="station-card pixel-frame flex min-h-72 flex-col rounded-lg bg-card p-4">
          <div class="mb-3 flex items-center gap-2">
            <span class="step-number">{{ index + 1 }}</span>
            <h3 class="font-pixel text-[11px] text-foreground">{{ station.name }}</h3>
            <span class="ml-auto shrink-0 rounded px-1.5 py-1 font-pixel text-[8px]" :class="STATUS_META[station.status].cls">{{ STATUS_META[station.status].label }}</span>
          </div>
          <Badge variant="outline" class="mb-3 w-fit px-1.5 py-0 font-mono text-[10px]">使用：{{ station.tool }}</Badge>
          <div class="mb-3">
            <p class="mb-1 text-[10px] font-bold text-foreground">你現在要做什麼</p>
            <p class="text-xs leading-relaxed text-muted-foreground">{{ station.role }}</p>
          </div>
          <div class="mb-4">
            <p class="mb-1 text-[10px] font-bold text-foreground">完成後會拿到</p>
            <p class="text-xs leading-relaxed text-muted-foreground">{{ station.handoff }}</p>
          </div>
          <p class="mb-3 mt-auto flex items-center gap-1 text-[10px]" :class="STATUS_META[station.status].cls.split(' ')[1]">
            <CheckCircle2 class="size-3" />{{ STATUS_META[station.status].explanation }}
          </p>
          <button
            v-if="station.invocation"
            type="button"
            class="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-primary/50 px-3 py-2 text-left text-[10px] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            @click="copyInvocation(station.invocation)"
          >
            <Copy class="size-3.5 shrink-0" /><span class="font-bold">複製這一步的啟動句</span>
          </button>
          <div v-else class="flex min-h-10 items-center rounded-md border border-border px-3 py-2 text-[10px] text-muted-foreground">這一步不需指令，照上方說明操作即可。</div>
        </article>
      </div>
      <div class="mt-3 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
        <ArrowDown class="size-3 text-primary" />三站依序進行，不需要同時操作
      </div>
    </section>

    <section id="templates" class="scroll-mt-6">
      <div class="mb-4">
        <h2 class="mb-2 font-pixel text-sm text-primary">最後一步：選履歷版型</h2>
        <p class="text-xs leading-relaxed text-muted-foreground">版型只決定最後文件的外觀，不會改寫你的經歷。投台灣本地職缺選中文版；投外商或需要 ATS 上傳的職缺選英文版。</p>
      </div>
      <div class="grid items-stretch gap-4 md:grid-cols-2">
        <article v-for="template in templates" :key="template.slug" class="pixel-frame flex min-h-[26rem] flex-col rounded-lg bg-card">
          <div class="flex items-center gap-2 border-b border-border bg-accent/30 px-4 py-3">
            <FileText class="size-4 shrink-0 text-primary" />
            <h3 class="font-bold">{{ template.name }}</h3>
            <Badge variant="outline" class="ml-auto px-1.5 py-0 text-[9px]">{{ template.route }}</Badge>
          </div>
          <div class="flex flex-1 flex-col gap-3 p-4">
            <p class="text-xs leading-relaxed text-muted-foreground">{{ template.description }}</p>
            <div class="rounded-md border border-border bg-background/40 p-3">
              <p class="mb-1 text-[10px] font-bold">適合什麼情況</p>
              <p class="text-xs text-muted-foreground">{{ template.route }}</p>
              <p class="mt-2 text-[10px] text-muted-foreground/70">排版基準：{{ template.basis }}</p>
            </div>
            <ul class="space-y-1.5">
              <li v-for="spec in template.specs" :key="spec" class="flex gap-2 text-xs leading-relaxed text-muted-foreground"><span class="shrink-0 text-primary">▸</span>{{ spec }}</li>
            </ul>
            <div class="mt-auto flex flex-wrap items-center gap-2 pt-3">
              <Button size="sm" class="gap-1.5 text-xs" @click="chooseTemplate(template)"><Copy class="size-3" />選這個版型</Button>
              <a :href="template.url" target="_blank" rel="noreferrer" class="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary"><ExternalLink class="size-3" />查看完整排版規格</a>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.step-number {
  display: inline-grid;
  width: 1.5rem;
  height: 1.5rem;
  flex: none;
  place-items: center;
  border: 1px solid hsl(var(--primary) / 0.65);
  border-radius: 999px;
  color: hsl(var(--primary));
  font-family: var(--font-pixel, monospace);
  font-size: 0.6rem;
}
.station-card { height: 100%; }
</style>

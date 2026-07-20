<script setup lang="ts">
import { computed, ref } from 'vue'
import { Copy, ExternalLink, GitBranch, Lock, Terminal } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import projectsData from '@/data/projects.json'
import type { Project, ProjectCategory } from '@/types'

// Stage Select(洛克人選關):STAGE 編號 + 中央徽記 + 斜切名牌 + 四角游標閃爍。
// 遊戲語彙 class(stage-cursor/game-plate/game-scanlines)定義在 main.css,手法移植自 figureshot-lab。
//
// 三態(狀態徽章;DEV 取代原 READY 字樣——這些是個人專案的部署連結,不是正式上線的意思):
// - deployUrl 有值 → DEV,點擊跳轉
// - deployUrl 為 null 但 startCommand 有值 → LOCAL,點擊複製啟動指令(貼終端機自己開;
//   本機限定工具無法部署,也不貼假 localhost 連結——同一個 port 當下可能是別的專案在跑)
// - 皆無 → LOCKED,等擁有者補
//
// 分類 tab(比照 Skills/Repos 頁同款 ToggleGroup 機制,第三個實例=同一套互動語言)+
// 狀態篩選 + 排序,三者互相獨立疊加。STAGE 編號固定取自原始 manifest 順序,
// 不隨排序/篩選重新編碼(關卡編號是這個專案的身分,不因檢視方式改變)。
const projects = projectsData as Project[]
const stageIndex = new Map(projects.map((p, i) => [p.name, i]))
const stageNo = (name: string) => String((stageIndex.get(name) ?? 0) + 1).padStart(2, '0')

const emblem = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

type Status = 'dev' | 'local' | 'locked'
const statusOf = (p: Project): Status => (p.deployUrl ? 'dev' : p.startCommand?.length ? 'local' : 'locked')

const CATEGORY_META: Record<ProjectCategory, { label: string; hint: string }> = {
  showcase: { label: 'SHOWCASE', hint: '展示' },
  tool: { label: 'TOOL', hint: '工具' },
  system: { label: 'SYSTEM', hint: '系統' },
  internal: { label: 'INTERNAL', hint: '內部' },
}
const CATEGORY_ORDER: ProjectCategory[] = ['showcase', 'tool', 'system', 'internal']

const STATUS_META: Record<Status, { label: string }> = {
  dev: { label: 'DEV' },
  local: { label: 'LOCAL' },
  locked: { label: 'LOCKED' },
}

const activeCategory = ref<ProjectCategory | 'all'>('all')
const activeStatus = ref<Status | 'all'>('all')
const sortMode = ref<'default' | 'name' | 'status'>('default')

const categoryCounts = computed(() => {
  const c: Record<string, number> = { all: projects.length }
  for (const cat of CATEGORY_ORDER) c[cat] = projects.filter((p) => p.category === cat).length
  return c
})

const visible = computed(() => {
  let list = projects.filter(
    (p) => (activeCategory.value === 'all' || p.category === activeCategory.value) &&
      (activeStatus.value === 'all' || statusOf(p) === activeStatus.value),
  )
  if (sortMode.value === 'name') {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortMode.value === 'status') {
    const rank: Record<Status, number> = { dev: 0, local: 1, locked: 2 }
    list = [...list].sort((a, b) => rank[statusOf(a)] - rank[statusOf(b)])
  }
  return list
})

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
    <p class="mb-4 text-xs text-muted-foreground">
      ~/Projects 下有頁面的系統;DEV 點擊出發,LOCAL 點擊複製啟動指令。LOCKED = 待補
    </p>

    <ToggleGroup
      type="single"
      :model-value="activeCategory"
      variant="outline"
      class="mb-3 flex-wrap justify-start"
      @update:model-value="(v) => v && (activeCategory = v as typeof activeCategory)"
    >
      <ToggleGroupItem value="all" class="gap-1 font-pixel text-[10px]">
        全部 <span class="text-[9px] opacity-70">×{{ categoryCounts.all }}</span>
      </ToggleGroupItem>
      <ToggleGroupItem v-for="c in CATEGORY_ORDER" :key="c" :value="c" class="gap-1 font-pixel text-[10px]">
        {{ CATEGORY_META[c].label }} <span class="text-[9px] opacity-70">{{ CATEGORY_META[c].hint }}</span>
        <span class="text-[9px] opacity-70">×{{ categoryCounts[c] }}</span>
      </ToggleGroupItem>
    </ToggleGroup>

    <div class="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
      <div class="flex items-center gap-1.5">
        <span class="font-pixel text-[9px] text-muted-foreground">狀態</span>
        <ToggleGroup
          type="single"
          :model-value="activeStatus"
          variant="outline"
          size="sm"
          @update:model-value="(v) => v && (activeStatus = v as typeof activeStatus)"
        >
          <ToggleGroupItem value="all" class="font-pixel text-[9px]">全部</ToggleGroupItem>
          <ToggleGroupItem v-for="(meta, s) in STATUS_META" :key="s" :value="s" class="font-pixel text-[9px]">
            {{ meta.label }}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="font-pixel text-[9px] text-muted-foreground">排序</span>
        <ToggleGroup
          type="single"
          :model-value="sortMode"
          variant="outline"
          size="sm"
          @update:model-value="(v) => v && (sortMode = v as typeof sortMode)"
        >
          <ToggleGroupItem value="default" class="font-pixel text-[9px]">預設</ToggleGroupItem>
          <ToggleGroupItem value="name" class="font-pixel text-[9px]">名稱</ToggleGroupItem>
          <ToggleGroupItem value="status" class="font-pixel text-[9px]">狀態</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <component
        :is="p.deployUrl ? 'a' : p.startCommand?.length ? 'button' : 'div'"
        v-for="p in visible"
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
          <span class="font-pixel text-[9px] text-muted-foreground">STAGE {{ stageNo(p.name) }}</span>
          <span
            v-if="p.deployUrl"
            class="rounded bg-success/15 px-1.5 py-0.5 font-pixel text-[9px] text-success"
          >
            DEV
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

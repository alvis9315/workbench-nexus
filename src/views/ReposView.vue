<script setup lang="ts">
import { computed } from 'vue'
import { Copy, ExternalLink, GitFork, Lock } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import reposData from '@/data/repos.json'
import type { Repo, RepoCategory } from '@/types'

// Weapon Get(洛克人武器選單):▶ 閃爍游標 + 武器代號塊 + 分組色能量條。
// 遊戲語彙 class(weapon-row/weapon-cursor/energy-bar)在 main.css。主要動作=點列複製網址。
const repos = reposData as Repo[]

const GROUPS: { value: RepoCategory; label: string; seg: string }[] = [
  { value: 'skill', label: 'SKILL 開發', seg: 'var(--primary)' },
  { value: 'product', label: '產品專案', seg: 'var(--success)' },
  { value: 'research', label: '研究', seg: 'var(--chart-3)' },
  { value: 'practice', label: '學習・練習', seg: 'var(--muted-foreground)' },
  { value: 'reference', label: 'FORK 參考', seg: 'var(--chart-4)' },
]

const grouped = computed(() =>
  GROUPS.map((g) => ({
    ...g,
    items: repos.filter((r) => r.category === g.value),
  })).filter((g) => g.items.length > 0),
)

// 武器代號:repo 名的字首兩碼(如 workbench-nexus → WN)
const weaponCode = (name: string) =>
  name
    .split(/[-_\s]+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const copyUrl = async (url: string, name: string) => {
  try {
    await navigator.clipboard.writeText(url)
    toast.success(`WEAPON GET!已複製 ${name} 的網址`)
  } catch {
    toast.error('複製失敗,請手動選取複製')
  }
}
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 pb-10">
    <h1 class="mb-1 font-pixel text-lg text-primary">WEAPON GET — REPOSITORIES</h1>
    <p class="mb-6 text-xs text-muted-foreground">點一列複製網址(裝備武器);共 {{ repos.length }} 個 repo</p>

    <section v-for="group in grouped" :key="group.value" class="mb-8">
      <h2 class="mb-2 flex items-center gap-2 font-pixel text-xs text-muted-foreground">
        {{ group.label }}
        <span class="text-[10px]">×{{ group.items.length }}</span>
      </h2>
      <div class="space-y-1.5">
        <button
          v-for="r in group.items"
          :key="r.name"
          type="button"
          class="weapon-row group flex w-full items-center gap-3 rounded-md border border-border/60 bg-card/70 px-3 py-2.5 text-left transition-colors hover:border-primary hover:bg-accent focus-visible:border-primary focus-visible:outline-none"
          :aria-label="`複製 ${r.name} 網址`"
          @click="copyUrl(r.url, r.name)"
        >
          <span class="weapon-cursor shrink-0 font-pixel text-xs text-primary">▶</span>

          <span
            class="game-plate flex size-9 shrink-0 items-center justify-center bg-accent font-pixel text-[10px] text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
          >
            {{ weaponCode(r.name) }}
          </span>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <p class="truncate text-sm font-bold group-hover:text-primary">{{ r.name }}</p>
              <Badge v-if="r.visibility === 'private'" variant="secondary" class="gap-0.5 px-1 py-0 text-[9px]">
                <Lock class="size-2.5" /> private
              </Badge>
              <Badge v-if="r.fork" variant="outline" class="gap-0.5 px-1 py-0 text-[9px]">
                <GitFork class="size-2.5" /> fork
              </Badge>
            </div>
            <p v-if="r.description" class="truncate text-xs text-muted-foreground">{{ r.description }}</p>
          </div>

          <span class="energy-bar hidden shrink-0 sm:block" :style="{ '--seg': group.seg }" />
          <Copy class="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
          <a
            :href="r.url"
            target="_blank"
            rel="noreferrer"
            class="shrink-0 rounded-md border border-transparent p-1.5 text-muted-foreground transition-all hover:scale-110 hover:border-primary hover:bg-primary/15 hover:text-primary"
            title="開啟 GitHub"
            @click.stop
          >
            <ExternalLink class="size-4" />
          </a>
        </button>
      </div>
    </section>
  </main>
</template>

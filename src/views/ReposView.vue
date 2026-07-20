<script setup lang="ts">
import { computed, ref } from 'vue'
import { createAvatar } from '@dicebear/core'
import { identicon } from '@dicebear/collection'
import { Copy, ExternalLink, GitFork, Lock, Pin, Star } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { usePinnedRepos } from '@/composables/usePinnedRepos'
import reposData from '@/data/repos.json'
import githubStarsData from '@/data/github-stars.json'
import type { Repo, RepoCategory, StarredRepo } from '@/types'

// Weapon Get(洛克人武器選單):維持單一列表呈現,不做第二種顯示模式。
// 「不想一直往下滑」原本想用摺疊解,但摺疊在這個量級(6 大類、42 筆)體驗仍生硬;
// 改採 Skills 頁同款機制(CategoryFilter 的單選 chips 篩選)——同一份武器列樣式,
// 只換「現在看哪一類」,是篩選範圍不是排版模式,不違反武器選單的單一樣式原則。
const repos = reposData as Repo[]
const githubStars = githubStarsData as StarredRepo[]
const { isPinned, togglePin, pinned } = usePinnedRepos(repos)

// 分類 tab:統一「ENGLISH + 中文提示」命名(比照 NavTabs 慣例),取代先前中英混雜的標籤
const TABS: { value: RepoCategory | 'stars'; label: string; hint: string; seg: string }[] = [
  { value: 'skill', label: 'SKILL', hint: '開發', seg: 'var(--primary)' },
  { value: 'product', label: 'PRODUCT', hint: '產品', seg: 'var(--success)' },
  { value: 'research', label: 'RESEARCH', hint: '研究', seg: 'var(--chart-3)' },
  { value: 'practice', label: 'PRACTICE', hint: '練習', seg: 'var(--muted-foreground)' },
  { value: 'reference', label: 'FORK', hint: '參考', seg: 'var(--chart-4)' },
  { value: 'stars', label: 'STARS', hint: '外部收藏', seg: 'var(--chart-5)' },
]

const counts = computed(() => {
  const c: Record<string, number> = { all: repos.length + githubStars.length }
  for (const t of TABS) c[t.value] = t.value === 'stars' ? githubStars.length : repos.filter((r) => r.category === t.value).length
  return c
})

// 預設落在 SKILL(數量小、最常查),不用「全部」——直接解決「不想一直滑」
const activeTab = ref<RepoCategory | 'stars' | 'all'>('skill')

const visibleRepoGroups = computed(() => {
  const cats = activeTab.value === 'all' ? TABS.filter((t) => t.value !== 'stars').map((t) => t.value) : [activeTab.value]
  return TABS.filter((t) => t.value !== 'stars' && (cats as string[]).includes(t.value)).map((t) => ({
    ...t,
    items: repos.filter((r) => r.category === t.value),
  }))
})
const showStars = computed(() => activeTab.value === 'all' || activeTab.value === 'stars')

const itemIcon = (name: string) =>
  createAvatar(identicon, { seed: name, size: 28, backgroundColor: [] }).toDataUri()

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
    <p class="mb-5 text-xs text-muted-foreground">點一列複製網址(裝備武器);📌 釘選常用</p>

    <!-- PINNED:自有 repo 的個人快取層,恆展開置頂,不受分頁篩選影響 -->
    <section class="mb-6">
      <h2 class="mb-2 flex items-center gap-2 font-pixel text-xs text-primary">
        <Pin class="size-3.5" fill="currentColor" />
        PINNED
        <span class="text-[10px] text-muted-foreground">×{{ pinned.length }}</span>
      </h2>
      <div v-if="pinned.length" class="space-y-1.5">
        <button
          v-for="r in pinned"
          :key="r.name"
          type="button"
          class="weapon-row group flex w-full items-center gap-3 rounded-md border border-primary/40 bg-primary/5 px-3 py-2.5 text-left transition-colors hover:border-primary hover:bg-accent focus-visible:border-primary focus-visible:outline-none"
          :aria-label="`複製 ${r.name} 網址`"
          @click="copyUrl(r.url, r.name)"
        >
          <span class="weapon-cursor shrink-0 font-pixel text-xs text-primary">▶</span>
          <span class="game-plate flex size-9 shrink-0 items-center justify-center bg-accent transition-colors group-hover:bg-primary/25">
            <img :src="itemIcon(r.name)" alt="" width="26" height="26" class="[image-rendering:pixelated]" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold group-hover:text-primary">{{ r.name }}</p>
            <p v-if="r.description" class="truncate text-xs text-muted-foreground">{{ r.description }}</p>
          </div>
          <Copy class="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
          <span
            role="button"
            tabindex="0"
            class="shrink-0 rounded-md p-1.5 text-primary transition-transform hover:scale-125"
            title="取消釘選"
            @click.stop="togglePin(r)"
            @keydown.enter.stop="togglePin(r)"
          >
            <Pin class="size-4" fill="currentColor" />
          </span>
        </button>
      </div>
      <p v-else class="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
        還沒有釘選的 repo——點下方任一列右側的 📌 加進這裡,常用武器不用每次翻分類找
      </p>
    </section>

    <!-- 分類 tab(單選 chips,同 Skills 頁 CategoryFilter 機制):只換篩選範圍,武器列樣式不變 -->
    <ToggleGroup
      type="single"
      :model-value="activeTab"
      variant="outline"
      class="mb-5 flex-wrap justify-start"
      @update:model-value="(v) => v && (activeTab = v as typeof activeTab)"
    >
      <ToggleGroupItem value="all" class="gap-1 font-pixel text-[10px]">
        全部 <span class="text-[9px] opacity-70">×{{ counts.all }}</span>
      </ToggleGroupItem>
      <ToggleGroupItem v-for="t in TABS" :key="t.value" :value="t.value" class="gap-1 font-pixel text-[10px]">
        {{ t.label }} <span class="text-[9px] opacity-70">{{ t.hint }}</span>
        <span class="text-[9px] opacity-70">×{{ counts[t.value] }}</span>
      </ToggleGroupItem>
    </ToggleGroup>

    <!-- 自有 repo:依 activeTab 篩選後的分類 -->
    <section v-for="group in visibleRepoGroups" :key="group.value" class="mb-6">
      <h3 v-if="activeTab === 'all'" class="mb-2 font-pixel text-[10px] text-muted-foreground">
        {{ group.label }} {{ group.hint }} <span class="text-[9px]">×{{ group.items.length }}</span>
      </h3>
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

          <span class="game-plate flex size-9 shrink-0 items-center justify-center bg-accent transition-colors group-hover:bg-primary/25">
            <img :src="itemIcon(r.name)" alt="" width="26" height="26" class="[image-rendering:pixelated]" />
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
          <span
            role="button"
            tabindex="0"
            class="shrink-0 rounded-md p-1.5 transition-transform hover:scale-125"
            :class="isPinned(r) ? 'text-primary' : 'text-muted-foreground/50 hover:text-primary'"
            :title="isPinned(r) ? '取消釘選' : '釘選到 PINNED'"
            @click.stop="togglePin(r)"
            @keydown.enter.stop="togglePin(r)"
          >
            <Pin class="size-4" :fill="isPinned(r) ? 'currentColor' : 'none'" />
          </span>
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

    <!-- GITHUB STARS:帳號本身加星標的外部 repo(非自有,唯讀書籤) -->
    <section v-if="showStars" class="mb-6">
      <h3 v-if="activeTab === 'all'" class="mb-2 flex items-center gap-1.5 font-pixel text-[10px] text-muted-foreground">
        <Star class="size-3" /> STARS 外部收藏 <span class="text-[9px]">×{{ githubStars.length }}</span>
      </h3>
      <div class="space-y-1.5">
        <button
          v-for="s in githubStars"
          :key="`${s.owner}/${s.name}`"
          type="button"
          class="weapon-row group flex w-full items-center gap-3 rounded-md border border-border/60 bg-card/70 px-3 py-2.5 text-left transition-colors hover:border-primary hover:bg-accent focus-visible:border-primary focus-visible:outline-none"
          :aria-label="`複製 ${s.owner}/${s.name} 網址`"
          @click="copyUrl(s.url, `${s.owner}/${s.name}`)"
        >
          <span class="weapon-cursor shrink-0 font-pixel text-xs text-primary">▶</span>

          <span class="game-plate flex size-9 shrink-0 items-center justify-center bg-accent transition-colors group-hover:bg-primary/25">
            <img :src="itemIcon(`${s.owner}/${s.name}`)" alt="" width="26" height="26" class="[image-rendering:pixelated]" />
          </span>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <p class="truncate text-sm font-bold group-hover:text-primary">{{ s.name }}</p>
              <span class="shrink-0 text-[10px] text-muted-foreground">{{ s.owner }}</span>
              <Badge variant="outline" class="px-1 py-0 text-[9px]">{{ s.language }}</Badge>
            </div>
            <p class="truncate text-xs text-muted-foreground">{{ s.description }}</p>
          </div>

          <Copy class="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
          <a
            :href="s.url"
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

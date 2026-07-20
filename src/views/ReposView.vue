<script setup lang="ts">
import { computed, reactive } from 'vue'
import { createAvatar } from '@dicebear/core'
import { identicon } from '@dicebear/collection'
import { ChevronDown, ChevronRight, Copy, ExternalLink, GitFork, Lock, Star } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { useRepoStars } from '@/composables/useRepoStars'
import reposData from '@/data/repos.json'
import type { Repo, RepoCategory } from '@/types'

// Weapon Get(洛克人武器選單):維持單一列表呈現,不做第二種顯示模式
// ——武器選單的辨識度就來自「一種樣子」,切換樣式等於稀釋這個隱喻。
// 「不想一直往下滑」改用兩招解:①分類預設摺疊,只展開想看的 ②STARRED 常用快取層恆展開置頂。
const repos = reposData as Repo[]
const { isStarred, toggleStar, starred } = useRepoStars(repos)

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

// 分類預設摺疊(每次進頁重置,離開分頁再回來也是摺疊狀態)
const expanded = reactive<Record<string, boolean>>({})
const isExpanded = (value: string) => expanded[value] ?? false
const toggleExpanded = (value: string) => {
  expanded[value] = !isExpanded(value)
}
const expandAll = () => GROUPS.forEach((g) => (expanded[g.value] = true))
const collapseAll = () => GROUPS.forEach((g) => (expanded[g.value] = false))

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
    <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="mb-1 font-pixel text-lg text-primary">WEAPON GET — REPOSITORIES</h1>
        <p class="text-xs text-muted-foreground">點一列複製網址(裝備武器);★ 收藏常用;共 {{ repos.length }} 個 repo</p>
      </div>
      <div class="flex gap-1.5">
        <button
          type="button"
          class="rounded-md border border-border px-2.5 py-1 font-pixel text-[9px] text-muted-foreground hover:border-primary hover:text-primary"
          @click="expandAll"
        >
          全部展開
        </button>
        <button
          type="button"
          class="rounded-md border border-border px-2.5 py-1 font-pixel text-[9px] text-muted-foreground hover:border-primary hover:text-primary"
          @click="collapseAll"
        >
          全部收合
        </button>
      </div>
    </div>

    <!-- STARRED:常用快取層,恆展開置頂,不受摺疊控制 -->
    <section class="mb-8">
      <h2 class="mb-2 flex items-center gap-2 font-pixel text-xs text-primary">
        <Star class="size-3.5" fill="currentColor" />
        STARRED
        <span class="text-[10px] text-muted-foreground">×{{ starred.length }}</span>
      </h2>
      <div v-if="starred.length" class="space-y-1.5">
        <button
          v-for="r in starred"
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
            title="取消收藏"
            @click.stop="toggleStar(r)"
            @keydown.enter.stop="toggleStar(r)"
          >
            <Star class="size-4" fill="currentColor" />
          </span>
        </button>
      </div>
      <p v-else class="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
        還沒有收藏的 repo——點下方任一列右側的 ☆ 加進這裡,常用武器不用每次翻分類找
      </p>
    </section>

    <!-- 分類:預設摺疊,點標題列展開/收合 -->
    <section v-for="group in grouped" :key="group.value" class="mb-3">
      <button
        type="button"
        class="mb-2 flex w-full items-center gap-2 rounded-md border border-transparent px-1 py-1 text-left font-pixel text-xs text-muted-foreground transition-colors hover:text-foreground"
        @click="toggleExpanded(group.value)"
      >
        <ChevronDown v-if="isExpanded(group.value)" class="size-3.5 shrink-0" />
        <ChevronRight v-else class="size-3.5 shrink-0" />
        {{ group.label }}
        <span class="text-[10px]">×{{ group.items.length }}</span>
      </button>

      <div v-show="isExpanded(group.value)" class="space-y-1.5">
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
            :class="isStarred(r) ? 'text-primary' : 'text-muted-foreground/50 hover:text-primary'"
            :title="isStarred(r) ? '取消收藏' : '收藏到 STARRED'"
            @click.stop="toggleStar(r)"
            @keydown.enter.stop="toggleStar(r)"
          >
            <Star class="size-4" :fill="isStarred(r) ? 'currentColor' : 'none'" />
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
  </main>
</template>

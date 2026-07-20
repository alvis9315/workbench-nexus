<script setup lang="ts">
import { computed, ref } from 'vue'
import { createAvatar } from '@dicebear/core'
import { shapes } from '@dicebear/collection'
import { Blocks, Box, ExternalLink, Search, Sparkles, SwatchBook, Wrench, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import itemsData from '@/data/ui-library.json'
import type { UiLibraryCategory, UiLibraryItem } from '@/types'

// ~/UILibrary 收藏圖鑑(道具商店式卡片):預覽區優先吃 preview 截圖,
// 沒截圖時用 shapes 生成的幾何紋樣佔位(seed=名稱,每項專屬)。
// 正本是資料夾本身,這頁是索引;新增收錄 = ui-library.json 加一行。
//
// 瀏覽 vs 查找兩種模式:沒下搜尋/標籤時維持分類分組瀏覽(COMPONENTS/3D/…);
// 一旦搜尋或選了標籤,收合成單一結果列表——查找時使用者要的是結果,不是分類結構,
// 分類再細也是要滑;標籤多選採 OR(符合任一標籤即算,收藏量小時避免篩到全空)。
const items = itemsData as UiLibraryItem[]

const CATEGORY_META: Record<UiLibraryCategory, { label: string; hint: string; icon: typeof Blocks }> = {
  components: { label: 'COMPONENTS', hint: 'UI 元件庫', icon: Blocks },
  '3d': { label: '3D GRAPHICS', hint: '3D / 圖形參考', icon: Box },
  'agent-skill': { label: 'AGENT SKILLS', hint: '圖形生成技能', icon: Sparkles },
  motion: { label: 'MOTION', hint: '動效 / 背景素材', icon: SwatchBook },
  'design-tool': { label: 'DESIGN TOOLS', hint: '設計工具', icon: Wrench },
}
const CATEGORY_ORDER: UiLibraryCategory[] = ['components', '3d', 'agent-skill', 'motion', 'design-tool']

const query = ref('')
const activeTags = ref<Set<string>>(new Set())

// 標籤雲:依出現頻率排序(常用標籤排前面,更快找到);點擊切換選取(多選)
const tagCloud = computed(() => {
  const freq = new Map<string, number>()
  for (const item of items) for (const t of item.tags) freq.set(t, (freq.get(t) ?? 0) + 1)
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }))
})
const toggleTag = (tag: string) => {
  const next = new Set(activeTags.value)
  if (next.has(tag)) next.delete(tag)
  else next.add(tag)
  activeTags.value = next
}

const isFiltering = computed(() => query.value.trim() !== '' || activeTags.value.size > 0)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return items.filter((item) => {
    const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.tags.some((t) => t.toLowerCase().includes(q))
    const matchesTags = activeTags.value.size === 0 || item.tags.some((t) => activeTags.value.has(t))
    return matchesQuery && matchesTags
  })
})

const clearFilters = () => {
  query.value = ''
  activeTags.value = new Set()
}

const GROUPS = computed(() =>
  CATEGORY_ORDER.map((c) => ({
    value: c,
    ...CATEGORY_META[c],
    items: items.filter((i) => i.category === c),
  })),
)

const placeholder = (name: string) =>
  createAvatar(shapes, { seed: name, size: 96, backgroundColor: ['0c1a33'] }).toDataUri()
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 pb-10">
    <h1 class="mb-1 font-pixel text-lg text-primary">UI LIBRARY</h1>
    <p class="mb-4 text-xs text-muted-foreground">
      ~/UILibrary 收藏圖鑑;實體在本機資料夾,vendor 更新用 git pull,授權逐項看
    </p>

    <div class="relative mb-3 max-w-sm">
      <Search class="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="query" placeholder="搜尋名稱 / 描述 / 標籤…" class="pl-8 text-xs" />
    </div>

    <div class="mb-6 flex flex-wrap items-center gap-1.5">
      <span class="font-pixel text-[9px] text-muted-foreground">TAGS</span>
      <button
        v-for="{ tag, count } in tagCloud"
        :key="tag"
        type="button"
        class="rounded-full border px-2.5 py-1 text-[11px] transition-colors"
        :class="
          activeTags.has(tag)
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground'
        "
        @click="toggleTag(tag)"
      >
        {{ tag }} <span class="opacity-70">×{{ count }}</span>
      </button>
      <button
        v-if="isFiltering"
        type="button"
        class="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-muted-foreground hover:text-primary"
        @click="clearFilters"
      >
        <X class="size-3" /> 清除篩選
      </button>
    </div>

    <!-- 查找結果:搜尋或標籤篩選中時,收合成單一結果列表 -->
    <template v-if="isFiltering">
      <p class="mb-3 text-xs text-muted-foreground">找到 {{ filtered.length }} 筆</p>
      <div v-if="filtered.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <component
          :is="item.url ? 'a' : 'div'"
          v-for="item in filtered"
          :key="item.name"
          :href="item.url ?? undefined"
          :target="item.url ? '_blank' : undefined"
          rel="noreferrer"
          class="pixel-frame group flex flex-col overflow-hidden rounded-lg bg-card"
          :class="item.url ? 'stage-cursor cursor-pointer transition-transform hover:-translate-y-1' : ''"
        >
          <div class="game-scanlines relative flex h-32 items-center justify-center overflow-hidden border-b border-border bg-accent/30">
            <img
              v-if="item.preview"
              :src="item.preview"
              alt=""
              class="size-full object-cover transition-transform group-hover:scale-105"
            />
            <img
              v-else
              :src="placeholder(item.name)"
              alt=""
              width="88"
              height="88"
              class="rounded-md opacity-80 transition-all group-hover:scale-110 group-hover:opacity-100"
            />
            <ExternalLink
              v-if="item.url"
              class="absolute right-2 top-2 size-3.5 text-muted-foreground group-hover:text-primary"
            />
          </div>

          <div class="flex flex-1 flex-col gap-1 p-3">
            <div class="flex flex-wrap items-center gap-1.5">
              <p class="truncate text-sm font-bold group-hover:text-primary">{{ item.name }}</p>
              <Badge variant="outline" class="px-1 py-0 text-[9px]">{{ CATEGORY_META[item.category].label }}</Badge>
              <Badge :variant="item.kind === 'vendor' ? 'secondary' : 'outline'" class="px-1 py-0 text-[9px]">
                {{ item.kind }}
              </Badge>
            </div>
            <p class="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{{ item.description }}</p>
            <div class="mt-1 flex flex-wrap gap-1">
              <span v-for="t in item.tags" :key="t" class="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                {{ t }}
              </span>
            </div>
          </div>
        </component>
      </div>
      <p v-else class="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
        沒有符合的收錄——換個關鍵字,或清除標籤篩選看全部
      </p>
    </template>

    <!-- 瀏覽模式:依內容類型分組(靜態區塊,不分頁——收錄量小,等 asset-library 擴充後才需要) -->
    <template v-else>
      <section v-for="group in GROUPS" :key="group.value" class="mb-8">
        <h2 class="mb-3 flex items-center gap-2 font-pixel text-xs text-muted-foreground">
          <component :is="group.icon" class="size-3.5" />
          {{ group.label }} <span class="text-[10px] opacity-70">{{ group.hint }}</span>
          <span class="text-[10px]">×{{ group.items.length }}</span>
        </h2>

        <div v-if="group.items.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <component
            :is="item.url ? 'a' : 'div'"
            v-for="item in group.items"
            :key="item.name"
            :href="item.url ?? undefined"
            :target="item.url ? '_blank' : undefined"
            rel="noreferrer"
            class="pixel-frame group flex flex-col overflow-hidden rounded-lg bg-card"
            :class="item.url ? 'stage-cursor cursor-pointer transition-transform hover:-translate-y-1' : ''"
          >
            <div class="game-scanlines relative flex h-32 items-center justify-center overflow-hidden border-b border-border bg-accent/30">
              <img
                v-if="item.preview"
                :src="item.preview"
                alt=""
                class="size-full object-cover transition-transform group-hover:scale-105"
              />
              <img
                v-else
                :src="placeholder(item.name)"
                alt=""
                width="88"
                height="88"
                class="rounded-md opacity-80 transition-all group-hover:scale-110 group-hover:opacity-100"
              />
              <ExternalLink
                v-if="item.url"
                class="absolute right-2 top-2 size-3.5 text-muted-foreground group-hover:text-primary"
              />
            </div>

            <div class="flex flex-1 flex-col gap-1 p-3">
              <div class="flex flex-wrap items-center gap-1.5">
                <p class="truncate text-sm font-bold group-hover:text-primary">{{ item.name }}</p>
                <Badge :variant="item.kind === 'vendor' ? 'secondary' : 'outline'" class="px-1 py-0 text-[9px]">
                  {{ item.kind }}
                </Badge>
                <Badge v-if="item.tech" variant="outline" class="px-1 py-0 text-[9px]">{{ item.tech }}</Badge>
              </div>
              <p class="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{{ item.description }}</p>
              <p v-if="item.license" class="mt-auto truncate pt-1 text-[10px] text-muted-foreground/70">
                授權:{{ item.license }}
              </p>
            </div>
          </component>
        </div>
        <p v-else class="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
          還沒有收錄——找到 {{ group.hint }} 資源時,ui-library.json 加一筆(category: "{{ group.value }}")就會出現在這
        </p>
      </section>
    </template>
  </main>
</template>

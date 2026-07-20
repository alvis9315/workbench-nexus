<script setup lang="ts">
import { computed } from 'vue'
import { createAvatar } from '@dicebear/core'
import { shapes } from '@dicebear/collection'
import { Blocks, Box, ExternalLink, Sparkles, SwatchBook, Wrench } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import itemsData from '@/data/ui-library.json'
import type { UiLibraryCategory, UiLibraryItem } from '@/types'

// ~/UILibrary 收藏圖鑑(道具商店式卡片):預覽區優先吃 preview 截圖,
// 沒截圖時用 shapes 生成的幾何紋樣佔位(seed=名稱,每項專屬)。
// 正本是資料夾本身,這頁是索引;新增收錄 = ui-library.json 加一行。
//
// 分組軸是「內容類型」不是「誰做的」(vendor/custom 降為卡片小標籤)——
// 靜態分組區塊,不做分頁:目前收錄量小(5 筆),分頁只會多一次點擊才看到內容,
// 等素材庫擴充到幾十筆(asset-library 規劃)時,才是分頁真正該登場的時候。
const items = itemsData as UiLibraryItem[]

const CATEGORY_META: Record<UiLibraryCategory, { label: string; hint: string; icon: typeof Blocks }> = {
  components: { label: 'COMPONENTS', hint: 'UI 元件庫', icon: Blocks },
  '3d': { label: '3D GRAPHICS', hint: '3D / 圖形參考', icon: Box },
  'agent-skill': { label: 'AGENT SKILLS', hint: '圖形生成技能', icon: Sparkles },
  motion: { label: 'MOTION', hint: '動效 / 背景素材', icon: SwatchBook },
  'design-tool': { label: 'DESIGN TOOLS', hint: '設計工具', icon: Wrench },
}
const CATEGORY_ORDER: UiLibraryCategory[] = ['components', '3d', 'agent-skill', 'motion', 'design-tool']

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
    <p class="mb-6 text-xs text-muted-foreground">
      ~/UILibrary 收藏圖鑑;實體在本機資料夾,vendor 更新用 git pull,授權逐項看
    </p>

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
                {{ item.kind === 'vendor' ? 'vendor' : 'custom' }}
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
  </main>
</template>

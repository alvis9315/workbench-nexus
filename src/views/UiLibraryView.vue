<script setup lang="ts">
import { computed } from 'vue'
import { ExternalLink, Package, Wrench } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import NavTabs from '@/components/NavTabs.vue'
import itemsData from '@/data/ui-library.json'
import type { UiLibraryItem } from '@/types'

// ~/UILibrary 收錄清單:vendor(第三方唯讀參考)/ custom(自製可重用正本)。
// 正本是資料夾本身,這頁是索引;新增收錄 = ui-library.json 加一行。
const items = itemsData as UiLibraryItem[]
const vendors = computed(() => items.filter((i) => i.kind === 'vendor'))
const customs = computed(() => items.filter((i) => i.kind === 'custom'))

const GROUPS = computed(() => [
  { label: 'VENDOR(第三方,唯讀參考)', icon: Package, items: vendors.value },
  { label: 'CUSTOM(自製正本,可跨專案重用)', icon: Wrench, items: customs.value },
])
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-10">
    <NavTabs />
    <h1 class="mb-1 font-pixel text-lg text-primary">UI LIBRARY</h1>
    <p class="mb-6 text-xs text-muted-foreground">
      ~/UILibrary 收錄索引;實體在本機資料夾,vendor 更新用 git pull,授權逐項看
    </p>

    <section v-for="group in GROUPS" :key="group.label" class="mb-8">
      <h2 class="mb-2 flex items-center gap-2 font-pixel text-xs text-muted-foreground">
        <component :is="group.icon" class="size-3.5" />
        {{ group.label }}
        <span class="text-[10px]">×{{ group.items.length }}</span>
      </h2>
      <div class="space-y-2">
        <div
          v-for="item in group.items"
          :key="item.name"
          class="pixel-frame flex w-full items-center gap-3 rounded-lg bg-card px-4 py-3"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <p class="truncate text-sm font-bold">{{ item.name }}</p>
              <Badge v-if="item.tech" variant="outline" class="px-1 py-0 text-[9px]">{{ item.tech }}</Badge>
            </div>
            <p class="truncate text-xs text-muted-foreground">{{ item.description }}</p>
            <p v-if="item.license" class="truncate text-[10px] text-muted-foreground/70">授權:{{ item.license }}</p>
          </div>
          <a
            v-if="item.url"
            :href="item.url"
            target="_blank"
            rel="noreferrer"
            class="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
            title="開啟來源"
          >
            <ExternalLink class="size-4" />
          </a>
        </div>
      </div>
    </section>
  </main>
</template>

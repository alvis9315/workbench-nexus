<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, Copy, ExternalLink, GitBranch, GitFork, Lock } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import reposData from '@/data/repos.json'
import type { Repo, RepoCategory } from '@/types'

// GitHub repos 頁(EXT-005):點一下複製 repo 網址(主要動作),外連為輔。
// 分組與標籤全由 repos.json 驅動(資料驅動、零硬編碼)。
const repos = reposData as Repo[]

const GROUPS: { value: RepoCategory; label: string }[] = [
  { value: 'skill', label: 'SKILL 開發' },
  { value: 'product', label: '產品專案' },
  { value: 'research', label: '研究' },
  { value: 'practice', label: '學習・練習' },
  { value: 'reference', label: 'FORK 參考' },
]

const grouped = computed(() =>
  GROUPS.map((g) => ({
    ...g,
    items: repos.filter((r) => r.category === g.value),
  })).filter((g) => g.items.length > 0),
)

const copyUrl = async (url: string, name: string) => {
  try {
    await navigator.clipboard.writeText(url)
    toast.success(`已複製 ${name} 的網址`)
  } catch {
    toast.error('複製失敗,請手動選取複製')
  }
}
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-10">
    <RouterLink to="/" class="mb-6 inline-block">
      <Button variant="outline" size="sm" class="gap-1.5 text-muted-foreground">
        <ArrowLeft class="size-4" /> 回工作站
      </Button>
    </RouterLink>
    <h1 class="mb-1 font-pixel text-lg text-primary">REPOSITORIES</h1>
    <p class="mb-6 text-xs text-muted-foreground">點一下複製網址;共 {{ repos.length }} 個 repo</p>

    <section v-for="group in grouped" :key="group.value" class="mb-8">
      <h2 class="mb-2 flex items-center gap-2 font-pixel text-xs text-muted-foreground">
        {{ group.label }}
        <span class="text-[10px]">×{{ group.items.length }}</span>
      </h2>
      <div class="space-y-2">
        <button
          v-for="r in group.items"
          :key="r.name"
          type="button"
          class="pixel-frame pixel-frame-interactive flex w-full items-center gap-3 rounded-lg bg-card px-4 py-3 text-left"
          :aria-label="`複製 ${r.name} 網址`"
          @click="copyUrl(r.url, r.name)"
        >
          <GitBranch class="size-4 shrink-0 text-primary" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <p class="truncate text-sm font-bold">{{ r.name }}</p>
              <Badge v-if="r.visibility === 'private'" variant="secondary" class="gap-0.5 px-1 py-0 text-[9px]">
                <Lock class="size-2.5" /> private
              </Badge>
              <Badge v-if="r.fork" variant="outline" class="gap-0.5 px-1 py-0 text-[9px]">
                <GitFork class="size-2.5" /> fork
              </Badge>
            </div>
            <p v-if="r.description" class="truncate text-xs text-muted-foreground">{{ r.description }}</p>
            <p v-else class="truncate text-xs text-muted-foreground">{{ r.url }}</p>
          </div>
          <Copy class="size-4 shrink-0 text-muted-foreground" />
          <a
            :href="r.url"
            target="_blank"
            rel="noreferrer"
            class="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
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

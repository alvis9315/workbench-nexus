<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowLeft, Copy, ExternalLink, GitBranch } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import repos from '@/data/repos.json'

// GitHub repos 頁(EXT-005):點一下複製 repo 網址(主要動作),外連為輔。
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
    <h1 class="mb-6 font-pixel text-lg text-primary">REPOSITORIES</h1>

    <div class="space-y-2">
      <button
        v-for="r in repos"
        :key="r.name"
        type="button"
        class="pixel-frame pixel-frame-interactive flex w-full items-center gap-3 rounded-lg bg-card px-4 py-3 text-left"
        :aria-label="`複製 ${r.name} 網址`"
        @click="copyUrl(r.url, r.name)"
      >
        <GitBranch class="size-4 shrink-0 text-primary" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-bold">{{ r.name }}</p>
          <p class="truncate text-xs text-muted-foreground">{{ r.url }}</p>
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
  </main>
</template>

<script setup lang="ts">
import { Copy, ExternalLink, FileText } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import templatesData from '@/data/resume-templates.json'
import type { ResumeTemplate } from '@/types'

// 履歷模板牆(同圖鑑模式):正本是 resume-templates/<slug>/TEMPLATE.md,這頁是索引。
// 卡片給「選哪個模板」需要的最小資訊(路線/骨架基準/規格摘要),
// 複製 slug 給 render 站指定模板用;完整規格點連結看 TEMPLATE.md。
// 模板零個資(視覺層規格),個資紅線見 specs/resume-pipeline.md §3。
const templates = templatesData as ResumeTemplate[]

const copySlug = async (slug: string) => {
  try {
    await navigator.clipboard.writeText(slug)
    toast.success(`ITEM GET!已複製 ${slug}`)
  } catch {
    toast.error('複製失敗,請手動選取複製')
  }
}
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 pb-10">
    <h1 class="mb-1 font-pixel text-lg text-primary">RESUME TEMPLATES</h1>
    <p class="mb-6 text-xs text-muted-foreground">
      resume-templates/ 視覺模板索引;內容層規則屬 resume-tailoring criteria,兩層分離。render 站用法見
      specs/resume-pipeline.md
    </p>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div v-for="t in templates" :key="t.slug" class="pixel-frame flex flex-col rounded-lg bg-card">
        <div class="flex items-center gap-2 border-b border-border bg-accent/30 px-4 py-3">
          <FileText class="size-4 shrink-0 text-primary" />
          <code class="truncate font-mono text-sm font-bold text-primary">{{ t.slug }}</code>
          <Badge variant="outline" class="px-1.5 py-0 text-[9px]">{{ t.route }}</Badge>
          <button
            type="button"
            class="ml-auto shrink-0 cursor-pointer rounded border border-border p-1 text-muted-foreground hover:border-primary hover:text-primary"
            :aria-label="`複製 ${t.slug}`"
            @click="copySlug(t.slug)"
          >
            <Copy class="size-3" />
          </button>
        </div>

        <div class="flex flex-1 flex-col gap-2 p-4">
          <p class="text-sm font-bold">{{ t.name }}</p>
          <p class="text-xs leading-relaxed text-muted-foreground">{{ t.description }}</p>
          <p class="text-[10px] text-muted-foreground/70">骨架基準:{{ t.basis }}</p>
          <ul class="mt-1 space-y-1">
            <li v-for="s in t.specs" :key="s" class="flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <span class="shrink-0 text-primary">▸</span>{{ s }}
            </li>
          </ul>
          <a
            :href="t.url"
            target="_blank"
            rel="noreferrer"
            class="mt-auto flex items-center gap-1 pt-2 text-xs text-muted-foreground hover:text-primary"
          >
            <ExternalLink class="size-3" /> 完整規格 TEMPLATE.md
          </a>
        </div>
      </div>
    </div>
  </main>
</template>

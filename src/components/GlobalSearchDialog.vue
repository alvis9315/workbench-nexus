<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalStorage } from '@vueuse/core'
import { CornerDownLeft, Search } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { activeTheme } from '@/themes'
import PixelSprite from '@/components/PixelSprite.vue'
import { useSpriteChar } from '@/composables/useSpriteChar'
import skillsData from '@/data/skills.json'
import projectsData from '@/data/projects.json'
import reposData from '@/data/repos.json'
import uiLibData from '@/data/ui-library.json'
import type { Skill } from '@/types'

// 小幫手的全域搜尋:搜整個工作站(skills / projects / repos / ui lib),命中即跳轉分區。
// 左=輸入+結果+推薦(最常搜的關鍵字,沒歷史就給四分區跳轉);右=小幫手角色
// 隨機連播「有穿衣服」的動作動畫(clothedPosesOf,idle 裸素體問題見 lpcSprites)。
const open = defineModel<boolean>('open', { default: false })
const router = useRouter()
const q = ref('')

interface Hit {
  label: string
  sub: string
  route: string
  section: string
  keywords: string
}
const INDEX: Hit[] = [
  ...(skillsData as Skill[]).map((s) => ({
    label: s.name,
    sub: s.description,
    route: '/',
    section: 'SKILLS',
    keywords: [s.id, ...(s.triggerKeywords ?? [])].join(' '),
  })),
  ...projectsData.map((p) => ({
    label: p.name,
    sub: p.description,
    route: '/projects',
    section: 'PROJECTS',
    keywords: p.folder ?? '',
  })),
  ...reposData.map((r) => ({
    label: r.name,
    sub: r.description ?? '',
    route: '/repos',
    section: 'REPOS',
    keywords: '',
  })),
  ...uiLibData.map((u) => ({
    label: u.name,
    sub: u.description ?? '',
    route: '/uilibrary',
    section: 'UI LIB',
    keywords: (u.tags ?? []).join(' '),
  })),
]

const hits = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return []
  return INDEX.filter((h) => `${h.label} ${h.sub} ${h.keywords}`.toLowerCase().includes(s)).slice(0, 8)
})

// 搜尋歷史:關鍵字 → 次數,取最常搜的當推薦;沒歷史時退回四分區跳轉
const history = useLocalStorage<Record<string, number>>('wn-search-history', {})
const topKeywords = computed(() =>
  Object.entries(history.value)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k),
)
const JUMPS = [
  { label: 'SKILLS 選角', route: '/' },
  { label: 'PROJECTS 關卡選擇', route: '/projects' },
  { label: 'REPOS 武器選單', route: '/repos' },
  { label: 'UI LIB 素材庫', route: '/uilibrary' },
]

const record = (kw: string) => {
  const k = kw.trim()
  if (k) history.value = { ...history.value, [k]: (history.value[k] ?? 0) + 1 }
}
const go = (h: Hit) => {
  record(q.value)
  open.value = false
  router.push(h.route)
}
const jump = (route: string) => {
  open.value = false
  router.push(route)
}

// 右側角色連播:開窗即啟動,隨機挑姿勢、不停止,關窗即停(省資源)
const char = useSpriteChar('mascot')
const pose = ref('')
let timer: number | undefined
const shuffle = () => {
  const poses = activeTheme.value.clothedPosesOf(char.value)
  if (poses.length) pose.value = poses[Math.floor(Math.random() * poses.length)]
}
watch(open, (v) => {
  clearInterval(timer)
  if (v) {
    q.value = ''
    shuffle()
    timer = window.setInterval(shuffle, 2600)
  }
})
onUnmounted(() => clearInterval(timer))
const charAsset = computed(() => activeTheme.value.poseAsset(char.value, pose.value))
const charDrawSize = computed(() => Math.round(144 * activeTheme.value.poseScale(char.value, pose.value)))
const charOffsetStyle = computed(() => {
  if (!charAsset.value) return undefined
  const offset = activeTheme.value.poseOffsetY(char.value, pose.value)
  return { marginTop: `${Math.round(offset / charAsset.value.cell * charDrawSize.value)}px` }
})
// oversize 錨定比照 SkillAvatar:貼底主題(寶可夢大隻)腳踩框底、往上溢出,不會掉出彈窗外
const charAnchorCls = computed(() =>
  activeTheme.value.oversizeAnchor === 'bottom'
    ? 'absolute bottom-0 left-1/2 z-20 max-w-none -translate-x-1/2'
    : 'absolute left-1/2 top-1/2 z-20 max-w-none -translate-x-1/2 -translate-y-1/2',
)
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="pixel-frame max-w-2xl sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle class="font-pixel text-sm">全域搜尋</DialogTitle>
        <DialogDescription>搜整個工作站:技能、專案、repo、UI 素材</DialogDescription>
      </DialogHeader>

      <div class="flex gap-5">
        <div class="min-w-0 flex-1 space-y-3">
          <div class="relative">
            <Search class="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model="q"
              placeholder="輸入關鍵字…"
              class="pl-8"
              autofocus
              @keydown.enter="hits[0] && go(hits[0])"
            />
          </div>

          <div v-if="q.trim()" class="space-y-1">
            <p v-if="!hits.length" class="px-1 py-6 text-center text-sm text-muted-foreground">
              沒有符合的結果
            </p>
            <button
              v-for="(h, i) in hits"
              :key="`${h.section}-${h.label}`"
              type="button"
              class="flex w-full cursor-pointer items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left hover:border-border hover:bg-muted"
              @click="go(h)"
            >
              <Badge variant="outline" class="w-16 shrink-0 justify-center font-pixel text-[8px]">
                {{ h.section }}
              </Badge>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm text-foreground">{{ h.label }}</span>
                <span class="block truncate text-xs text-muted-foreground">{{ h.sub }}</span>
              </span>
              <CornerDownLeft v-if="i === 0" class="size-3.5 shrink-0 text-muted-foreground" />
            </button>
          </div>

          <div v-else class="space-y-2">
            <template v-if="topKeywords.length">
              <p class="font-pixel text-[10px] text-muted-foreground">常搜關鍵字</p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="k in topKeywords"
                  :key="k"
                  type="button"
                  class="cursor-pointer rounded-md border border-border px-2 py-1 text-xs text-foreground hover:border-primary hover:text-primary"
                  @click="q = k"
                >
                  {{ k }}
                </button>
              </div>
            </template>
            <p class="font-pixel text-[10px] text-muted-foreground">快速跳轉</p>
            <div class="grid grid-cols-2 gap-1.5">
              <button
                v-for="j in JUMPS"
                :key="j.route"
                type="button"
                class="cursor-pointer rounded-md border border-border px-2 py-1.5 text-left text-xs text-foreground hover:border-primary hover:text-primary"
                @click="jump(j.route)"
              >
                {{ j.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex w-44 shrink-0 flex-col items-center justify-center gap-2 self-stretch">
          <div class="relative size-36">
            <PixelSprite
              v-if="charAsset"
              :asset="charAsset"
              :width="charDrawSize"
              class="pointer-events-none"
              :class="charAnchorCls"
              :style="charOffsetStyle"
            />
          </div>
          <p class="font-pixel text-[10px] text-muted-foreground">{{ activeTheme.charLabel(char) }}</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

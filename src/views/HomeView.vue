<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { Search, History, Grid3x3, Grid2x2, Columns2, PackageOpen, Minus, Plus, RotateCcw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Kbd } from '@/components/ui/kbd'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import SkillCard from '@/components/SkillCard.vue'
import ThemePicker from '@/components/ThemePicker.vue'
import CategoryFilter from '@/components/CategoryFilter.vue'
import CommandPalette from '@/components/CommandPalette.vue'
import SkillDetailDialog from '@/components/SkillDetailDialog.vue'
import Hotbar from '@/components/Hotbar.vue'
import LaunchLogDialog from '@/components/LaunchLogDialog.vue'
import FallingSprites, { type FallingSpriteItem } from '@/components/effects/FallingSprites.vue'
import { usePins } from '@/composables/usePins'
import { activeTheme } from '@/themes'
import skillsData from '@/data/skills.json'
import type { Skill, SkillCategory } from '@/types'
// skill 頭像:SkillAvatar 內建 LPC sprite(seed→角色配對在 src/data/lpcSprites.ts,
// 姿勢由卡片上的選單切換),這裡不需要再覆蓋 avatar slot。

// 主頁 = 選角室(SKILL SELECT):⌘K 搜尋 + 分類 chips + 選角格 grid。
// 其他分區(Projects 關卡選擇 / Repos 武器選單 / UI Lib)由 NavTabs 切換。
const skills = skillsData as Skill[]
const { pinned, isPinned, togglePin } = usePins(skills)
const logOpen = ref(false)
const toyboxOpen = useLocalStorage('wn-toybox-open', false)
const toyboxScale = useLocalStorage<number>('wn-toybox-scale', 1)
const activeCategory = ref<SkillCategory | 'all'>('all')

const adjustToyboxScale = (delta: number) => {
  toyboxScale.value = Math.min(1.6, Math.max(0.6, Math.round((toyboxScale.value + delta) * 10) / 10))
}

// 物理層吃統一的四語意槽；不直接知道 guild／pokemon／Marvel 的檔案或姿勢名。
// 每個主題的原生尺寸差異很大，先等比例正規化到 72px 再交給 FallingSprites。
const toyboxSprites = computed<FallingSpriteItem[]>(() =>
  activeTheme.value.chars.slice(0, 12).flatMap((char) => {
    const frame = activeTheme.value.charFrame(char)
    const ratio = 72 / Math.max(frame.w, frame.h)
    const idle = activeTheme.value.poseAsset(char, activeTheme.value.slotPose(char, 'idle'))
    const grab = activeTheme.value.poseAsset(char, activeTheme.value.slotPose(char, 'grab'))
    if (!idle) return []
    return [{
      id: char,
      label: activeTheme.value.charLabel(char),
      idle,
      grab,
      width: Math.max(frame.w * ratio, 24),
      height: Math.max(frame.h * ratio, 24),
    }]
  }),
)

// 選角格密度:每排 6 / 4 / 2 張,記在 localStorage。
// class 寫全名(不能模板字串拼接)——Tailwind JIT 掃原始碼字面值
// 卡片變大,人物與標題字級也跟著放大——大卡配小字看不清楚 skill 名稱
const GRID_OPTIONS = [
  { value: '6', cls: 'grid-cols-6', avatarSize: 88, nameCls: 'text-[9px]', catCls: 'text-[9px]', icon: Grid3x3, label: '一排六張' },
  { value: '4', cls: 'grid-cols-4', avatarSize: 120, nameCls: 'text-[11px]', catCls: 'text-[10px]', icon: Grid2x2, label: '一排四張' },
  { value: '2', cls: 'grid-cols-2', avatarSize: 176, nameCls: 'text-sm', catCls: 'text-xs', icon: Columns2, label: '一排兩張' },
] as const
type GridCols = (typeof GRID_OPTIONS)[number]['value']
const gridCols = useLocalStorage<GridCols>('wn-grid-cols', '6')
const gridMeta = computed(() => GRID_OPTIONS.find((o) => o.value === gridCols.value) ?? GRID_OPTIONS[0])
// ToggleGroup 取消選取會回空值 → 折回原值
const onGridCols = (v: unknown) => {
  if (GRID_OPTIONS.some((o) => o.value === v)) gridCols.value = v as GridCols
}
const filtered = computed(() =>
  activeCategory.value === 'all' ? skills : skills.filter((s) => s.category === activeCategory.value),
)

const palette = useTemplateRef('palette')
const openSkillId = ref<string | null>(null)
const openSkill = (id: string) => {
  openSkillId.value = id
}
const activeSkill = computed(() => skills.find((s) => s.id === openSkillId.value) ?? null)

// 彈窗左右切換:沿完整 skills 順序前後移動,端點鎖定
const activeIndex = computed(() => skills.findIndex((s) => s.id === openSkillId.value))
const hasPrev = computed(() => activeIndex.value > 0)
const hasNext = computed(() => activeIndex.value >= 0 && activeIndex.value < skills.length - 1)
const goPrev = () => {
  if (hasPrev.value) openSkillId.value = skills[activeIndex.value - 1].id
}
const goNext = () => {
  if (hasNext.value) openSkillId.value = skills[activeIndex.value + 1].id
}
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 pb-10">
    <div class="mb-4 flex items-center justify-end gap-2">
      <ThemePicker />
      <Button
        :variant="toyboxOpen ? 'secondary' : 'outline'"
        class="gap-2 text-muted-foreground"
        :aria-pressed="toyboxOpen"
        @click="toyboxOpen = !toyboxOpen"
      >
        <PackageOpen class="size-4" />
        <span class="text-xs">夾娃娃</span>
      </Button>
      <Button variant="outline" size="icon" class="text-muted-foreground" title="使用紀錄" @click="logOpen = true">
        <History class="size-4" />
      </Button>
      <Button variant="outline" class="gap-2 text-muted-foreground" @click="palette && (palette.open = true)">
        <Search class="size-4" />
        <span class="text-xs">搜尋技能</span>
        <Kbd class="ml-1">⌘K</Kbd>
      </Button>
    </div>

    <Hotbar :pinned="pinned" :skills="skills" />

    <section v-if="toyboxOpen" class="pixel-frame mb-6 overflow-hidden bg-card/70">
      <div class="flex items-center justify-between border-b border-border/70 px-4 py-2">
        <div>
          <h2 class="font-pixel text-[10px] text-foreground">SPRITE DROP</h2>
          <p class="mt-1 text-[11px] text-muted-foreground">抓住角色拖曳、甩動，再放回娃娃堆。</p>
        </div>
        <div class="flex items-center gap-1">
          <span class="mr-2 hidden font-pixel text-[9px] text-muted-foreground sm:inline">{{ activeTheme.label }}</span>
          <Button
            variant="ghost"
            size="icon"
            class="size-7"
            title="縮小角色"
            :disabled="toyboxScale <= 0.6"
            @click="adjustToyboxScale(-0.1)"
          >
            <Minus class="size-3.5" />
          </Button>
          <button
            type="button"
            class="min-w-12 rounded px-1 py-1 font-pixel text-[9px] text-muted-foreground hover:bg-muted"
            title="重設為 100%"
            @click="toyboxScale = 1"
          >
            {{ Math.round(toyboxScale * 100) }}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            class="size-7"
            title="放大角色"
            :disabled="toyboxScale >= 1.6"
            @click="adjustToyboxScale(0.1)"
          >
            <Plus class="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="size-7"
            title="重設角色大小"
            :disabled="toyboxScale === 1"
            @click="toyboxScale = 1"
          >
            <RotateCcw class="size-3" />
          </Button>
        </div>
      </div>
      <div class="h-80 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_55%)]">
        <FallingSprites
          :key="activeTheme.id"
          :sprites="toyboxSprites"
          :scale="toyboxScale"
          trigger="auto"
          :gravity="0.9"
          :restitution="0.72"
          :grab-stiffness="0.16"
        />
      </div>
    </section>

    <div class="mb-6 flex items-center justify-between gap-3">
      <CategoryFilter v-model="activeCategory" />
      <ToggleGroup
        type="single"
        :model-value="gridCols"
        variant="outline"
        size="sm"
        class="shrink-0"
        @update:model-value="onGridCols"
      >
        <ToggleGroupItem
          v-for="o in GRID_OPTIONS"
          :key="o.value"
          :value="o.value"
          :aria-label="o.label"
          :title="o.label"
        >
          <component :is="o.icon" class="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>

    <div v-if="filtered.length" class="grid gap-3" :class="gridMeta.cls">
      <SkillCard
        v-for="(s, i) in filtered"
        :key="s.id"
        :skill="s"
        :avatar-size="gridMeta.avatarSize"
        :name-cls="gridMeta.nameCls"
        :cat-cls="gridMeta.catCls"
        :pinned="isPinned(s)"
        class="reveal-up"
        :style="{ animationDelay: `${Math.min(i * 45, 400)}ms` }"
        @open="openSkill"
        @toggle-pin="togglePin(s)"
      />
    </div>
    <Empty v-else class="py-16">
      <EmptyHeader>
        <EmptyTitle class="font-pixel text-sm">NO SKILLS</EmptyTitle>
        <EmptyDescription>這個分類還沒有技能——去 skills.json 加一行就會出現。</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <CommandPalette ref="palette" :skills="skills" @pick="openSkill" />
    <SkillDetailDialog
      :skill="activeSkill"
      :pinned="activeSkill ? isPinned(activeSkill) : false"
      :has-prev="hasPrev"
      :has-next="hasNext"
      @close="openSkillId = null"
      @toggle-pin="activeSkill && togglePin(activeSkill)"
      @prev="goPrev"
      @next="goNext"
    />
    <LaunchLogDialog v-model:open="logOpen" :skills="skills" />
  </main>
</template>

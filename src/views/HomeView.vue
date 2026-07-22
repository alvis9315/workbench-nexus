<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { Search, History, Grid3x3, Grid2x2, Columns2, PackageOpen, Minus, Plus, RotateCcw, MousePointer2, Gamepad2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
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
import ToyboxRosterDialog from '@/components/ToyboxRosterDialog.vue'
import { usePins } from '@/composables/usePins'
import { toyboxLimitForScale, useToyboxRoster } from '@/composables/useToyboxRoster'
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
const clawControlMode = useLocalStorage<'free' | 'arcade'>('wn-claw-control-mode', 'free')
const clawCommand = ref<{ sequence: number; action: 'left' | 'right' | 'up' | 'down' | 'confirm' }>({ sequence: 0, action: 'confirm' })
const toyboxLimit = computed(() => toyboxLimitForScale(toyboxScale.value))
const activeCategory = ref<SkillCategory | 'all'>('all')
const toyboxDragActive = ref(false)
const toyboxDropTarget = ref(false)
const { chars: toyboxChars, add: addToyboxChar, remove: removeToyboxChar, clear: clearToybox } = useToyboxRoster()

const adjustToyboxScale = (delta: number) => {
  toyboxScale.value = Math.min(1.6, Math.max(0.6, Math.round((toyboxScale.value + delta) * 10) / 10))
}
const sendClawCommand = (action: typeof clawCommand.value.action) => {
  clawCommand.value = { sequence: clawCommand.value.sequence + 1, action }
}

// 物理層吃統一的四語意槽；不直接知道 guild／pokemon／Marvel 的檔案或姿勢名。
// 每個主題的原生尺寸差異很大，先等比例正規化到 72px 再交給 FallingSprites。
const toyboxSprites = computed<FallingSpriteItem[]>(() =>
  toyboxChars.value.flatMap((char) => {
    const frame = activeTheme.value.charFrame(char)
    const ratio = 72 / Math.max(frame.w, frame.h)
    const idlePose = activeTheme.value.slotPose(char, 'idle')
    const idle = activeTheme.value.poseAsset(char, idlePose)
    const move = activeTheme.value.poseAsset(char, activeTheme.value.slotPose(char, 'move'))
    const grab = activeTheme.value.poseAsset(char, activeTheme.value.slotPose(char, 'grab'))
    const action = activeTheme.value.poseAsset(char, activeTheme.value.slotPose(char, 'action'))
    if (!idle) return []
    // 大體型寶可夢的 GIF cell 是 64px、一般角色是 32px。先前只看 charFrame 會把兩者
    // 都正規化成 72px，失去原生體型；把 poseScale 帶回來並設 2x 安全上限。
    const nativeScale = Math.min(activeTheme.value.poseScale(char, idlePose), 2)
    return [{
      id: char,
      label: activeTheme.value.charLabel(char),
      idle,
      move,
      grab,
      action,
      width: Math.max(frame.w * ratio * nativeScale, 24),
      height: Math.max(frame.h * ratio * nativeScale, 24),
    }]
  }),
)
// 只有換主題才重建物理世界；增刪單一角色由 FallingSprites 增量同步。
const toyboxKey = computed(() => activeTheme.value.id)

const addToToybox = (char: string) => {
  const result = addToyboxChar(char, toyboxLimit.value)
  if (result === 'added') toast.success(`${activeTheme.value.charLabel(char)} 已放進娃娃機`)
  else if (result === 'duplicate') toast.info(`${activeTheme.value.charLabel(char)} 已經在娃娃機裡`)
  else if (result === 'full') toast.warning(`${Math.round(toyboxScale.value * 100)}% 尺寸上限是 ${toyboxLimit.value} 隻，請先移除角色或縮小尺寸`)
}
const onPrizeOut = (char: string) => {
  removeToyboxChar(char)
  toast.info(`${activeTheme.value.charLabel(char)} 已從 PRIZE OUT 離開娃娃機`)
}
const onToyboxDrop = (event: DragEvent) => {
  toyboxDropTarget.value = false
  toyboxDragActive.value = false
  const char = event.dataTransfer?.getData('application/x-workbench-character')
  if (char) addToToybox(char)
}

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

    <section
      v-if="toyboxOpen"
      class="toybox-machine pixel-frame relative mb-6 overflow-hidden rounded-lg bg-card/70"
      :class="toyboxDropTarget ? 'is-drop-target' : ''"
      @dragenter.prevent="toyboxDropTarget = true"
      @dragover.prevent="toyboxDropTarget = true"
      @dragleave.self="toyboxDropTarget = false"
      @drop.prevent="onToyboxDrop"
    >
      <div class="toybox-marquee flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-2.5">
        <div>
          <h2 class="font-pixel text-[11px] text-primary">NEXUS CLAW // SPRITE DROP</h2>
          <p class="mt-1 text-[11px] text-muted-foreground">抓角色、甩動、放回；也可以把下方技能卡直接拖進玻璃箱。</p>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-1">
          <ToyboxRosterDialog
            :chars="toyboxChars"
            :limit="toyboxLimit"
            @add="addToToybox"
            @remove="removeToyboxChar"
            @clear="clearToybox"
          />
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
            :title="`重設為 100%；容量：60–70%=30、80–90%=24、100–110%=18、120–130%=14、140–160%=10`"
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
      <div class="toybox-glass relative h-[26rem] overflow-hidden">
        <div class="toybox-glare pointer-events-none absolute inset-0 z-20" />
        <div class="toybox-floor pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[42%]">
          <div class="toybox-floor-grid absolute inset-0" />
          <div class="toybox-floor-lip absolute inset-x-0 bottom-0 h-5" />
        </div>
        <div class="toybox-prize-chute pointer-events-none absolute bottom-5 left-6 z-[500]">
          <div class="toybox-prize-mouth"><span>PRIZE OUT</span></div>
          <div class="toybox-prize-depth" />
        </div>
        <div
          v-if="!toyboxSprites.length && !toyboxDragActive"
          class="pointer-events-none absolute inset-0 z-10 grid place-items-center"
        >
          <div class="rounded-lg border border-dashed border-border bg-background/75 px-6 py-5 text-center shadow-lg">
            <PackageOpen class="mx-auto mb-3 size-7 text-muted-foreground" />
            <p class="font-pixel text-[10px] text-foreground">CLAW MACHINE EMPTY</p>
            <p class="mt-2 text-xs text-muted-foreground">按「{{ activeTheme.id === 'pokemon' ? '加入寶可夢' : '加入角色' }}」，或把下方技能卡拖進來。</p>
          </div>
        </div>
        <FallingSprites
          :key="toyboxKey"
          :sprites="toyboxSprites"
          :scale="toyboxScale"
          trigger="auto"
          :gravity="0.9"
          :restitution="0.72"
          :grab-stiffness="0.16"
          :control-mode="clawControlMode"
          :command="clawCommand"
          wander
          @prize="onPrizeOut"
        />
        <div
          v-if="toyboxDragActive"
          class="pointer-events-none absolute inset-4 z-[1000] grid place-items-center rounded-lg border-2 border-dashed border-primary bg-background/70"
          :class="toyboxDropTarget ? 'text-primary' : 'text-muted-foreground'"
        >
          <div class="text-center">
            <PackageOpen class="mx-auto mb-3 size-8" />
            <p class="font-pixel text-xs">DROP CHARACTER HERE</p>
            <p class="mt-2 text-xs">放開就加入娃娃機 · {{ toyboxChars.length }}/{{ toyboxLimit }}</p>
          </div>
        </div>
      </div>
      <div class="toybox-control-deck flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="mr-2 font-pixel text-[8px] text-muted-foreground">CAPACITY {{ toyboxChars.length }}/{{ toyboxLimit }}</span>
          <Button
            size="sm"
            :variant="clawControlMode === 'free' ? 'secondary' : 'ghost'"
            class="h-7 gap-1.5 px-2 text-[10px]"
            @click="clawControlMode = 'free'"
          >
            <MousePointer2 class="size-3" />自由甩爪
          </Button>
          <Button
            size="sm"
            :variant="clawControlMode === 'arcade' ? 'secondary' : 'ghost'"
            class="h-7 gap-1.5 px-2 text-[10px]"
            @click="clawControlMode = 'arcade'"
          >
            <Gamepad2 class="size-3" />實機按鍵
          </Button>
          <div v-if="clawControlMode === 'arcade'" class="ml-1 flex items-center gap-1" aria-label="夾爪方向控制">
            <Button v-for="key in (['left', 'up', 'down', 'right'] as const)" :key="key" size="icon" variant="outline" class="size-7" @click="sendClawCommand(key)">
              {{ { left: '←', right: '→', up: '↑', down: '↓' }[key] }}
            </Button>
            <Button size="sm" class="h-7 px-3 font-pixel text-[8px]" @click="sendClawCommand('confirm')">DROP / GRAB</Button>
          </div>
        </div>
        <span class="text-[10px]" :class="toyboxChars.length > toyboxLimit ? 'text-warning' : 'text-muted-foreground'">
          {{ clawControlMode === 'arcade' ? '方向鍵移動；第一次下降、第二次抓取，抓起後再按一次放開。' : `${Math.round(toyboxScale * 100)}% 可新增至 ${toyboxLimit} 隻；既有角色不會因放大被自動刪除。` }}
        </span>
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
        :toybox-open="toyboxOpen"
        class="reveal-up"
        :style="{ animationDelay: `${Math.min(i * 45, 400)}ms` }"
        @open="openSkill"
        @toggle-pin="togglePin(s)"
        @toybox-drag-start="toyboxDragActive = true"
        @toybox-drag-end="toyboxDragActive = false; toyboxDropTarget = false"
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

<style scoped>
.toybox-machine {
  border-color: hsl(var(--primary) / 0.7);
  box-shadow:
    inset 0 0 0 4px hsl(var(--background) / 0.7),
    0 0 28px hsl(var(--primary) / 0.08);
}
.toybox-machine::before,
.toybox-machine::after {
  position: absolute;
  z-index: 35;
  top: 4.25rem;
  bottom: 2.5rem;
  width: 8px;
  content: '';
  pointer-events: none;
  background: linear-gradient(90deg, #0f172a, #94a3b8 45%, #334155 55%, #020617);
  box-shadow: 0 0 8px rgb(0 0 0 / 0.45);
}
.toybox-machine::before { left: 0; }
.toybox-machine::after { right: 0; transform: scaleX(-1); }
.toybox-marquee {
  background:
    linear-gradient(90deg, hsl(var(--primary) / 0.08), transparent 25% 75%, hsl(var(--primary) / 0.08)),
    hsl(var(--card) / 0.96);
  box-shadow: inset 0 -3px 0 hsl(var(--primary) / 0.14);
}
.toybox-glass {
  background:
    linear-gradient(180deg, hsl(var(--primary) / 0.06), transparent 28%),
    repeating-linear-gradient(90deg, transparent 0 63px, hsl(var(--border) / 0.08) 64px),
    linear-gradient(180deg, hsl(var(--card) / 0.72), hsl(var(--background) / 0.96));
}
.toybox-glare {
  background: linear-gradient(112deg, transparent 0 18%, rgb(255 255 255 / 0.025) 19% 26%, transparent 27% 100%);
}
.toybox-floor {
  overflow: hidden;
  border-top: 2px solid rgb(148 163 184 / 0.55);
  background:
    linear-gradient(180deg, rgb(79 84 94 / 0.72), rgb(37 41 48 / 0.98)),
    #3f444d;
  box-shadow: inset 0 20px 32px rgb(0 0 0 / 0.24);
  perspective: 260px;
}
.toybox-floor-grid {
  inset: -58% -18% -12%;
  opacity: 0.58;
  background-image:
    linear-gradient(rgb(226 232 240 / 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgb(226 232 240 / 0.16) 1px, transparent 1px);
  background-size: 92px 46px;
  transform: rotateX(57deg);
  transform-origin: center bottom;
  clip-path: polygon(8% 0, 92% 0, 100% 100%, 0 100%);
}
.toybox-floor-lip {
  border-top: 3px solid #64748b;
  background: linear-gradient(180deg, #334155, #0f172a 42%, #020617);
  box-shadow: 0 -4px 10px rgb(0 0 0 / 0.45);
}
.toybox-prize-chute {
  width: 154px;
  height: 76px;
  filter: drop-shadow(0 8px 5px rgb(0 0 0 / 0.45));
  font-family: var(--font-pixel, monospace);
  font-size: 7px;
}
.toybox-prize-mouth {
  position: absolute;
  inset: 0 0 11px;
  display: grid;
  place-items: center;
  color: #8594aa;
  background: linear-gradient(145deg, #94a3b8, #475569 45%, #1e293b);
  clip-path: polygon(18% 0, 82% 0, 100% 100%, 0 100%);
  box-shadow:
    inset 0 8px 12px rgb(255 255 255 / 0.1),
    inset 0 -6px 0 #0f172a;
}
.toybox-prize-mouth::before {
  position: absolute;
  inset: 6px 9px 8px;
  content: '';
  background: radial-gradient(ellipse at 50% 22%, #17233a, #020617 70%);
  clip-path: polygon(16% 0, 84% 0, 100% 100%, 0 100%);
  box-shadow: inset 0 12px 18px rgb(0 0 0 / 0.9);
}
.toybox-prize-mouth span {
  position: relative;
  z-index: 1;
  transform: translateY(8px);
}
.toybox-prize-depth {
  position: absolute;
  right: 7px;
  bottom: 0;
  left: 7px;
  height: 15px;
  border: 3px solid #334155;
  border-top: 0;
  background: linear-gradient(180deg, #1e293b, #020617);
  clip-path: polygon(8% 0, 92% 0, 100% 100%, 0 100%);
}
.toybox-control-deck {
  background: linear-gradient(180deg, #334155, #0f172a 32%, hsl(var(--card)) 34%);
}
.toybox-machine.is-drop-target {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 32px hsl(var(--primary) / 0.28);
}
</style>

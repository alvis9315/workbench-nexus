<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { activeTheme } from '@/themes'
import { useSpriteChar } from '@/composables/useSpriteChar'
import { useSpritePose } from '@/composables/useSpritePose'
import CharPicker from '@/components/CharPicker.vue'
import PosePicker from '@/components/PosePicker.vue'
import PixelSprite from '@/components/PixelSprite.vue'
import GlobalSearchDialog from '@/components/GlobalSearchDialog.vue'

// 角落小幫手(REQ-007 → 升級):住在 App 殼、跨分頁常駐。
// 1) 輪播使用提醒(泡泡自動換);2) hover 可換角色與姿勢;3) 點角色開全域搜尋彈窗。
// 尺寸吃 poseScale(大隻寶可夢畫大、依主題錨定溢出),跟技能卡同一套規則。
const char = useSpriteChar('mascot')
const pose = useSpritePose('mascot')
const asset = computed(() => activeTheme.value.poseAsset(char.value, pose.value))
const scale = computed(() => activeTheme.value.poseScale(char.value, pose.value))
const drawSize = computed(() => Math.round(80 * scale.value))
const oversizeCls = computed(() =>
  activeTheme.value.oversizeAnchor === 'bottom'
    ? 'absolute bottom-0 left-1/2 z-20 max-w-none -translate-x-1/2'
    : 'absolute left-1/2 top-1/2 z-20 max-w-none -translate-x-1/2 -translate-y-1/2',
)

const TIPS = [
  '⌘K 可以直接搜尋技能',
  '點我可以搜尋整個工作站',
  'hover 技能卡左上角能換角色和姿勢',
  '分類列最右邊可以切換卡片排列密度',
  '點技能卡複製調用 prompt 去 Claude 貼上',
  '釘選技能會出現在 Hotbar 快速列',
]
const tip = ref(0)
let timer: number | undefined
onMounted(() => {
  timer = window.setInterval(() => {
    tip.value = (tip.value + 1) % TIPS.length
  }, 6000)
})
onUnmounted(() => clearInterval(timer))

const searchOpen = ref(false)
</script>

<template>
  <!-- 右上角:右下會卡到內容區;max-w-5xl 置中版型的右上外側是留白帶,常駐不擋內容 -->
  <div class="fixed right-5 top-5 z-40 flex items-start gap-2">
    <Transition
      mode="out-in"
      enter-active-class="transition duration-300"
      enter-from-class="translate-y-1 opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="opacity-0"
    >
      <p
        :key="tip"
        class="mt-1 max-w-52 rounded-md rounded-tr-none border border-border bg-card/95 px-3 py-2 text-xs leading-relaxed text-muted-foreground shadow-md"
      >
        {{ TIPS[tip] }}
      </p>
    </Transition>

    <div class="group/mascot relative">
      <div
        class="absolute -bottom-7 left-0 z-10 flex gap-1 opacity-0 transition focus-within:opacity-100 group-hover/mascot:opacity-100 has-[[data-state=open]]:opacity-100"
      >
        <CharPicker seed="mascot" name="小幫手" />
        <PosePicker seed="mascot" name="小幫手" />
      </div>
      <button
        type="button"
        class="pixel-frame pixel-frame-interactive block cursor-pointer rounded-lg bg-card p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="開啟全域搜尋"
        title="搜尋整個工作站"
        @click="searchOpen = true"
      >
        <!-- 佔位框固定 80px(按鈕不跳),oversize 依主題錨定溢出(比照 SkillAvatar) -->
        <div class="relative size-20">
          <PixelSprite
            v-if="asset"
            :asset="asset"
            :width="drawSize"
            class="pointer-events-none"
            :class="scale > 1 ? oversizeCls : ''"
          />
        </div>
      </button>
    </div>
  </div>

  <GlobalSearchDialog v-model:open="searchOpen" />
</template>

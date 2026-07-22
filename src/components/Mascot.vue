<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { MessageSquareOff, MessageSquareText } from 'lucide-vue-next'
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
const anchorCls = computed(() =>
  activeTheme.value.oversizeAnchor === 'bottom'
    ? 'absolute bottom-0 left-1/2 z-20 max-w-none -translate-x-1/2'
    : 'absolute left-1/2 top-1/2 z-20 max-w-none -translate-x-1/2 -translate-y-1/2',
)
const offsetStyle = computed(() => {
  if (!asset.value) return undefined
  const offset = activeTheme.value.poseOffsetY(char.value, pose.value)
  return { marginTop: `${Math.round(offset / asset.value.cell * drawSize.value)}px` }
})

const TIPS = [
  '⌘K 可以直接搜尋技能',
  '點我可以搜尋整個工作站',
  'hover 技能卡左上角能換角色和姿勢',
  '分類列最右邊可以切換卡片排列密度',
  '點技能卡複製調用 prompt 去 Claude 貼上',
  '釘選技能會出現在 Hotbar 快速列',
]
const tip = ref(0)
const tipsOpen = useLocalStorage('wn-mascot-tips-open', true)
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
  <div class="fixed right-5 top-5 z-40">
    <button
      type="button"
      class="absolute right-[calc(100%+0.5rem)] top-1 z-30 grid size-8 place-items-center rounded border border-[#526984] bg-[#aebdcd] text-[#27364a] shadow-[0_3px_0_#273449] transition hover:-translate-y-0.5 hover:bg-[#c2ced9]"
      :title="tipsOpen ? '關閉小幫手訊息' : '打開小幫手訊息'"
      :aria-label="tipsOpen ? '關閉小幫手訊息' : '打開小幫手訊息'"
      :aria-pressed="tipsOpen"
      @click="tipsOpen = !tipsOpen"
    >
      <MessageSquareOff v-if="tipsOpen" class="size-4" />
      <MessageSquareText v-else class="size-4" />
    </button>
    <Transition
      mode="out-in"
      enter-active-class="transition duration-300"
      enter-from-class="translate-y-1 opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="opacity-0"
    >
      <p
        v-if="tipsOpen"
        :key="tip"
        class="mascot-dialog absolute right-[calc(100%+3rem)] top-1 w-52 px-3 py-2 text-xs font-medium leading-relaxed"
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
            :class="anchorCls"
            :style="offsetStyle"
          />
        </div>
      </button>
    </div>
  </div>

  <GlobalSearchDialog v-model:open="searchOpen" />
</template>

<style scoped>
.mascot-dialog {
  position: absolute;
  border: 2px solid #526984;
  border-radius: 4px;
  color: #27364a;
  background: #b9c7d5;
  box-shadow:
    inset 0 0 0 2px #d4dde5,
    0 4px 0 #273449;
}
.mascot-dialog::before,
.mascot-dialog::after {
  position: absolute;
  top: 13px;
  width: 0;
  height: 0;
  content: '';
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}
.mascot-dialog::before {
  right: -11px;
  border-left: 10px solid #526984;
}
.mascot-dialog::after {
  right: -7px;
  border-left: 8px solid #b9c7d5;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { GripVertical, Star } from 'lucide-vue-next'
import SkillAvatar from '@/components/SkillAvatar.vue'
import PosePicker from '@/components/PosePicker.vue'
import CharPicker from '@/components/CharPicker.vue'
import { categoryLabel } from '@/data/categories'
import { activeTheme } from '@/themes'
import { useSpriteChar } from '@/composables/useSpriteChar'
import { useSpritePose } from '@/composables/useSpritePose'
import type { Skill, SkillStatus } from '@/types'

// 技能牆格子(MvC 選角風):方形立繪格 + 底部名條 + hover 金框游標。
// 頭像 slot 解耦——換手繪/GIF 只動 slot 內容。名稱文字恆在(可用性硬規則)。
// 姿勢選擇器是 button 的「兄弟」元素而非子元素——button 內不能巢狀互動元件,
// 也讓它的點擊天然不觸發開卡。
const props = withDefaults(
  defineProps<{ skill: Skill; avatarSize?: number; nameCls?: string; catCls?: string; pinned?: boolean; toyboxOpen?: boolean }>(),
  { avatarSize: 88, nameCls: 'text-[9px]', catCls: 'text-[9px]', pinned: false, toyboxOpen: false },
)
const emit = defineEmits<{ open: [id: string]; togglePin: []; toyboxDragStart: [char: string]; toyboxDragEnd: [] }>()

const STATUS_META: Record<SkillStatus, { label: string; cls: string }> = {
  ready: { label: 'READY', cls: 'bg-success/20 text-success' },
  running: { label: 'RUN', cls: 'bg-warning/20 text-warning' },
  idle: { label: 'IDLE', cls: 'bg-muted text-muted-foreground' },
}
const status = () => STATUS_META[props.skill.status ?? 'ready']

// oversize 武器姿勢:解除卡片裁切,讓武器衝出框外(破格效果)
const char = useSpriteChar(props.skill.seed)
const pose = useSpritePose(props.skill.seed)
const oversize = computed(() => activeTheme.value.poseScale(char.value, pose.value) > 1)
const onDragStart = (event: DragEvent) => {
  if (!props.toyboxOpen || !event.dataTransfer) {
    event.preventDefault()
    return
  }
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/x-workbench-character', char.value)
  event.dataTransfer.setData('application/x-workbench-sprite', JSON.stringify({ char: char.value, pose: pose.value }))
  event.dataTransfer.setData('text/plain', char.value)
  emit('toyboxDragStart', char.value)
}
</script>

<template>
  <div class="group relative">
    <button
      type="button"
      class="pixel-frame pixel-frame-interactive relative flex aspect-square w-full flex-col items-stretch rounded-lg bg-card text-left transition-transform group-hover:-translate-y-0.5 group-hover:ring-2 group-hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      :class="oversize ? 'overflow-visible' : 'overflow-hidden'"
      :draggable="toyboxOpen"
      :aria-label="`開啟 ${skill.name}`"
      @click="emit('open', skill.id)"
      @dragstart="onDragStart"
      @dragend="emit('toyboxDragEnd')"
    >
      <div class="flex min-h-0 flex-1 items-center justify-center rounded-t-lg bg-accent/40 p-3">
        <slot name="avatar">
          <SkillAvatar :seed="skill.seed" :size="avatarSize" class="transition-transform group-hover:scale-110" />
        </slot>
      </div>

      <div class="rounded-b-lg border-t border-border bg-background/70 px-2 py-1.5">
        <p
          class="truncate text-center font-pixel leading-relaxed text-card-foreground group-hover:text-primary"
          :class="nameCls"
        >
          {{ skill.name }}
        </p>
        <div class="mt-0.5 flex min-w-0 items-center justify-center gap-1.5">
          <p class="min-w-0 truncate text-center text-muted-foreground" :class="catCls">{{ categoryLabel(skill.category) }}</p>
          <span class="shrink-0 rounded px-1 py-0.5 font-pixel text-[7px]" :class="status().cls">
            {{ status().label }}
          </span>
        </div>
      </div>
    </button>

    <!-- flex:消掉 inline line-box 的垂直空隙,讓 top 間距真的等於 left 間距;
         hover 位移跟卡片本體同步,懸浮時間距不跑掉 -->
    <div
      class="absolute left-1.5 top-1.5 z-30 flex opacity-0 transition focus-within:opacity-100 group-hover:-translate-y-0.5 group-hover:opacity-100 has-[[data-state=open]]:opacity-100"
    >
      <div class="flex items-center gap-1">
        <span
          v-if="toyboxOpen"
          class="grid cursor-grab place-items-center rounded border border-primary/40 bg-background/90 px-1 py-0.5 text-primary active:cursor-grabbing"
          title="按住卡片拖進娃娃機"
        >
          <GripVertical class="size-2.5" />
        </span>
        <!-- 釘選捷徑:不用開詳情彈窗就能釘/解除 Hotbar -->
        <button
          type="button"
          class="cursor-pointer rounded border border-border bg-background/80 px-1 py-0.5 hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          :class="pinned ? 'text-primary' : 'text-muted-foreground hover:text-primary'"
          :title="pinned ? '取消釘選(移出 Hotbar)' : '釘選到 Hotbar'"
          :aria-label="`${pinned ? '取消釘選' : '釘選'} ${skill.name}`"
          @click.stop="emit('togglePin')"
        >
          <Star class="size-2.5" :fill="pinned ? 'currentColor' : 'none'" />
        </button>
        <CharPicker :seed="skill.seed" :name="skill.name" />
        <PosePicker :seed="skill.seed" :name="skill.name" />
      </div>
    </div>
  </div>
</template>

import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { charForSeed, defaultPoseOf } from '@/data/lpcSprites'

/**
 * 每個 skill 的 sprite 姿勢選擇,存 localStorage(比照 usePins:預設值管出廠設定,
 * 偏好管個人化)。卡片/Hotbar/詳情彈窗共用同一份,切換即全站同步。
 */
const poses = useLocalStorage<Record<string, string>>('wn-sprite-poses', {})

export const useSpritePose = (seed: string) =>
  computed({
    get: () => poses.value[seed] ?? defaultPoseOf(charForSeed(seed)),
    set: (v: string) => {
      poses.value = { ...poses.value, [seed]: v }
    },
  })

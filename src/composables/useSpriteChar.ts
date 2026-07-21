import { computed } from 'vue'
import { activeTheme } from '@/themes'
import { spriteStore } from '@/composables/spriteStore'

/**
 * 每個 seed(skill id / 'mascot')的角色選擇,存 localStorage、按主題分 key
 * (換主題各自記憶):預設值管出廠配對 charForSeed,偏好管個人化。
 * 卡片/Hotbar/彈窗共用,切換即全站同步。
 */
export const useSpriteChar = (seed: string) =>
  computed({
    get: () => {
      const t = activeTheme.value
      const c = spriteStore(`wn-sprite-chars:${t.id}`).value[seed]
      return c && t.chars.includes(c) ? c : t.charForSeed(seed)
    },
    set: (v: string) => {
      const store = spriteStore(`wn-sprite-chars:${activeTheme.value.id}`)
      store.value = { ...store.value, [seed]: v }
    },
  })

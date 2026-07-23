import { computed } from 'vue'
import { activeTheme } from '@/themes'
import { spriteStore } from '@/composables/spriteStore'

/**
 * 每個 seed 的 sprite 姿勢選擇,存 localStorage、按主題分 key(比照 usePins:
 * 預設值管出廠設定,偏好管個人化)。卡片/Hotbar/詳情彈窗共用,切換即全站同步。
 * 預設姿勢跟著「目前生效的角色」走(含使用者換過的角色)。
 */
export const useSpritePose = (seed: string) =>
  computed({
    get: () => {
      const t = activeTheme.value
      const charOverride = spriteStore(`wn-sprite-chars:${t.id}`).value[seed]
      const char = charOverride && t.chars.includes(charOverride) ? charOverride : t.charForSeed(seed)
      const stored = spriteStore(`wn-sprite-poses:${t.id}`).value[seed]
      // 素材從主題移除後，舊 localStorage 不得留在無效 pose key。
      if (stored && t.posesOf(char).includes(stored)) return stored
      return t.defaultPoseOf(char)
    },
    set: (v: string) => {
      const store = spriteStore(`wn-sprite-poses:${activeTheme.value.id}`)
      store.value = { ...store.value, [seed]: v }
    },
  })

import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { Skill } from '@/types'

/**
 * 釘選(EXT-001):manifest 的 pinned 是預設值,使用者切換存 localStorage
 * override——資料按本質存:manifest 管出廠設定,偏好管個人化。
 */
const overrides = useLocalStorage<Record<string, boolean>>('wn-pin-overrides', {})

export const usePins = (skills: Skill[]) => {
  const isPinned = (s: Skill) => overrides.value[s.id] ?? s.pinned
  const togglePin = (s: Skill) => {
    overrides.value = { ...overrides.value, [s.id]: !isPinned(s) }
  }
  const pinned = computed(() => skills.filter((s) => isPinned(s)))
  return { isPinned, togglePin, pinned }
}

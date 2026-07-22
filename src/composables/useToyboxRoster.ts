import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { activeTheme } from '@/themes'

export const TOYBOX_LIMIT = 24

type AddResult = 'added' | 'duplicate' | 'full' | 'invalid'

export const useToyboxRoster = () => {
  const rosters = useLocalStorage<Record<string, string[]>>('wn-toybox-rosters', {})

  const chars = computed<string[]>({
    get: () => {
      const theme = activeTheme.value
      const stored = rosters.value[theme.id]
      const source = Array.isArray(stored) ? stored : theme.chars.slice(0, 12)
      return source.filter((char, index) => theme.chars.includes(char) && source.indexOf(char) === index).slice(0, TOYBOX_LIMIT)
    },
    set: (next) => {
      const theme = activeTheme.value
      rosters.value = {
        ...rosters.value,
        [theme.id]: next.filter((char, index) => theme.chars.includes(char) && next.indexOf(char) === index).slice(0, TOYBOX_LIMIT),
      }
    },
  })

  const add = (char: string): AddResult => {
    if (!activeTheme.value.chars.includes(char)) return 'invalid'
    if (chars.value.includes(char)) return 'duplicate'
    if (chars.value.length >= TOYBOX_LIMIT) return 'full'
    chars.value = [...chars.value, char]
    return 'added'
  }

  const remove = (char: string) => {
    chars.value = chars.value.filter((entry) => entry !== char)
  }

  const clear = () => {
    chars.value = []
  }

  return { chars, add, remove, clear }
}

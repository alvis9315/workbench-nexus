import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { activeTheme } from '@/themes'

export const TOYBOX_HARD_LIMIT = 30

// 大圖在高倍率時同時增加 DOM decode、Matter body 與畫面遮擋；倍率越高就降低新增上限。
// 已在機台內的角色不會因調倍率被自動刪掉，只會暫停新增直到數量回到目前上限內。
export const toyboxLimitForScale = (scale: number) => {
  if (scale <= 0.7) return 30
  if (scale <= 0.9) return 24
  if (scale <= 1.1) return 18
  if (scale <= 1.3) return 14
  return 10
}

type AddResult = 'added' | 'updated' | 'duplicate' | 'full' | 'invalid'

export const useToyboxRoster = () => {
  const rosters = useLocalStorage<Record<string, string[]>>('wn-toybox-rosters', {})
  const poseStores = useLocalStorage<Record<string, Record<string, string>>>('wn-toybox-poses', {})

  const chars = computed<string[]>({
    get: () => {
      const theme = activeTheme.value
      const stored = rosters.value[theme.id]
      const source = Array.isArray(stored) ? stored : theme.chars.slice(0, 12)
      return source.filter((char, index) => theme.chars.includes(char) && source.indexOf(char) === index).slice(0, TOYBOX_HARD_LIMIT)
    },
    set: (next) => {
      const theme = activeTheme.value
      rosters.value = {
        ...rosters.value,
        [theme.id]: next.filter((char, index) => theme.chars.includes(char) && next.indexOf(char) === index).slice(0, TOYBOX_HARD_LIMIT),
      }
    },
  })

  const poses = computed<Record<string, string>>({
    get: () => {
      const theme = activeTheme.value
      const stored = poseStores.value[theme.id] ?? {}
      return Object.fromEntries(
        Object.entries(stored).filter(([char, pose]) => theme.chars.includes(char) && theme.posesOf(char).includes(pose)),
      )
    },
    set: (next) => {
      const theme = activeTheme.value
      poseStores.value = { ...poseStores.value, [theme.id]: next }
    },
  })

  const add = (char: string, limit = TOYBOX_HARD_LIMIT, pose?: string): AddResult => {
    if (!activeTheme.value.chars.includes(char)) return 'invalid'
    const validPose = pose && activeTheme.value.posesOf(char).includes(pose) ? pose : undefined
    if (chars.value.includes(char)) {
      if (validPose && poses.value[char] !== validPose) {
        poses.value = { ...poses.value, [char]: validPose }
        return 'updated'
      }
      return 'duplicate'
    }
    if (chars.value.length >= Math.min(limit, TOYBOX_HARD_LIMIT)) return 'full'
    chars.value = [...chars.value, char]
    if (validPose) poses.value = { ...poses.value, [char]: validPose }
    return 'added'
  }

  const remove = (char: string) => {
    chars.value = chars.value.filter((entry) => entry !== char)
    const { [char]: _removed, ...remaining } = poses.value
    poses.value = remaining
  }

  const clear = () => {
    chars.value = []
    poses.value = {}
  }

  return { chars, poses, add, remove, clear }
}

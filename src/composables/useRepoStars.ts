import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { Repo } from '@/types'

/**
 * repo 收藏(比照 usePins 的 skill 釘選模式):純 localStorage,
 * repos.json 無 pinned 欄位可當出廠預設,故一律預設未收藏。
 */
const overrides = useLocalStorage<Record<string, boolean>>('wn-repo-star-overrides', {})

export const useRepoStars = (repos: Repo[]) => {
  const isStarred = (r: Repo) => overrides.value[r.name] ?? false
  const toggleStar = (r: Repo) => {
    overrides.value = { ...overrides.value, [r.name]: !isStarred(r) }
  }
  const starred = computed(() => repos.filter((r) => isStarred(r)))
  return { isStarred, toggleStar, starred }
}

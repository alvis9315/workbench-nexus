import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { Repo } from '@/types'

/**
 * 自有 repo 的個人快取釘選(比照 usePins 的 skill 釘選模式):純 localStorage,
 * repos.json 無 pinned 欄位可當出廠預設,故一律預設未釘選。
 * 命名刻意避開「star」——GitHub 本身的 Stars 是另一個概念(見 github-stars.json),
 * 兩者語意不同,不可共用詞彙互相混淆。
 */
const overrides = useLocalStorage<Record<string, boolean>>('wn-repo-pin-overrides', {})

export const usePinnedRepos = (repos: Repo[]) => {
  const isPinned = (r: Repo) => overrides.value[r.name] ?? false
  const togglePin = (r: Repo) => {
    overrides.value = { ...overrides.value, [r.name]: !isPinned(r) }
  }
  const pinned = computed(() => repos.filter((r) => isPinned(r)))
  return { isPinned, togglePin, pinned }
}

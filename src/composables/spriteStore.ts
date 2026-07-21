import type { Ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'

/** 主題分 key 的偏好儲存(wn-sprite-poses:guild 這類),同 key 共用同一個 ref */
const stores = new Map<string, Ref<Record<string, string>>>()

export const spriteStore = (key: string): Ref<Record<string, string>> => {
  let s = stores.get(key)
  if (!s) {
    s = useLocalStorage<Record<string, string>>(key, {})
    stores.set(key, s)
  }
  return s
}

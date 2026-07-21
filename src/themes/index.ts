import { computed, shallowRef, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { SpriteTheme } from '@/themes/types'
// 選單用的代表角色小圖:單張靜態 import 只進 URL 字串,素材本體仍按需載入
// (guild 是 strip 主題,icon.png 為 A 角 walk_down 首幀的單幀切圖,直接 <img> 不會拖出整條 strip)
import guildIcon from '@/assets/themes/guild/icon.png'
import pokemonIcon from '@/assets/themes/pokemon/pikachu/idle.gif'

// 主題註冊表:懶載入——只有啟用中的主題會被 import(主包零成長鐵則;
// pokemon 主題 565 隻角色,eager 全載會把首包撐爆)。新主題在這兩處掛上即可。
// shareable 同步主題模組宣告(false=含第三方 IP,錄影/demo 前不得啟用;theme-mainline-v2 §3.4)
export const THEME_META = [
  { id: 'guild', label: '冒險者公會', icon: guildIcon, shareable: true },
  { id: 'pokemon', label: '寶可夢圖鑑', icon: pokemonIcon, shareable: false },
] as const

const loaders: Record<string, () => Promise<{ default: SpriteTheme }>> = {
  guild: () => import('@/themes/guild'),
  pokemon: () => import('@/themes/pokemon'),
}

// 一次性遷移:主題化前的偏好 key(無主題字尾)搬到 guild 名下,不丟使用者既有設定
if (typeof window !== 'undefined') {
  for (const k of ['wn-sprite-poses', 'wn-sprite-chars']) {
    const legacy = localStorage.getItem(k)
    if (legacy && !localStorage.getItem(`${k}:guild`)) localStorage.setItem(`${k}:guild`, legacy)
  }
}

export const themeId = useLocalStorage<string>('wn-theme', 'guild')

const load = (id: string) => (loaders[id] ?? loaders.guild)().then((m) => m.default)

// top-level await:app 首繪前就要有主題(sync 介面),之後換主題才走非同步熱替換
const current = shallowRef<SpriteTheme>(await load(themeId.value))

watch(themeId, async (id) => {
  current.value = await load(id)
})

/** 目前生效的主題(sync 取用;換主題時短暫維持舊值直到新模組載入完成) */
export const activeTheme = computed<SpriteTheme>(() => current.value)

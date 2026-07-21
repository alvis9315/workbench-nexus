import type { SpriteTheme } from '@/themes/types'

// 「寶可夢圖鑑」主題:素材由 scripts/import-pokemon.mjs 從 vscode-pokemon repo 匯入,
// assets/themes/pokemon/<pokemon>/<pose>.gif + meta.json(display_name/generation/license)。
// ⚠️ 圖像是任天堂/Game Freak IP,僅限本機自用,不得公開部署(見 meta.json license 欄)。
// 姿勢無方向字尾(idle/walk/shiny_idle/shiny_walk),PosePicker 原生支援。
const modules = import.meta.glob('../../assets/themes/pokemon/*/*.gif', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const SPRITES: Record<string, Record<string, string>> = {}
for (const [path, url] of Object.entries(modules)) {
  const m = path.match(/pokemon\/([^/]+)\/([^/]+)\.gif$/)
  if (!m) continue
  ;(SPRITES[m[1]] ??= {})[m[2]] = url
}

const metas = import.meta.glob('../../assets/themes/pokemon/*/meta.json', {
  eager: true,
  import: 'default',
}) as Record<
  string,
  { display_name?: string; generation?: string; dex?: number | null; sizes?: Record<string, number> }
>

const CHAR_LABEL: Record<string, string> = {}
const CHAR_GEN: Record<string, string> = {}
const CHAR_DEX: Record<string, number> = {}
const CHAR_SIZES: Record<string, Record<string, number>> = {}
for (const [path, meta] of Object.entries(metas)) {
  const m = path.match(/pokemon\/([^/]+)\/meta\.json$/)
  if (!m) continue
  if (meta.display_name) CHAR_LABEL[m[1]] = meta.display_name
  if (meta.generation) CHAR_GEN[m[1]] = meta.generation
  if (meta.dex != null) CHAR_DEX[m[1]] = meta.dex
  if (meta.sizes) CHAR_SIZES[m[1]] = meta.sizes
}

// 官方素材尺寸不一(多數 32px,Lugia 等大隻 64px)——這是刻意的體型差,
// 依原生尺寸比例呈現:所有寶可夢共用同一放大倍率(像素密度一致),大隻的就是大
const BASE_CELL = 32

// 圖鑑編號序(全部/各世代頁籤都沿用此順序;同編號的變體如 female 排本體後面)
const CHARS = Object.keys(SPRITES).sort(
  (a, b) => (CHAR_DEX[a] ?? 9999) - (CHAR_DEX[b] ?? 9999) || a.localeCompare(b),
)

const defaultPoseOf = (char: string): string => {
  const poses = SPRITES[char] ?? {}
  return 'idle' in poses ? 'idle' : (Object.keys(poses)[0] ?? '')
}

const pokemon: SpriteTheme = {
  id: 'pokemon',
  // 任天堂/Game Freak IP:僅限本機自用,錄影/demo/portfolio 一律不得用此主題
  shareable: false,
  label: '寶可夢圖鑑',
  chars: CHARS,
  charLabel: (char) => CHAR_LABEL[char] ?? char,
  groups: [
    { id: 'gen1', label: '一世代' },
    { id: 'gen2', label: '二世代' },
    { id: 'gen3', label: '三世代' },
    { id: 'gen4', label: '四世代' },
  ],
  charGroupOf: (char) => CHAR_GEN[char] ?? 'gen1',
  charForSeed: (seed) => {
    if (seed === 'mascot' && SPRITES.pikachu) return 'pikachu'
    if (!CHARS.length) return ''
    let h = 0
    for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0
    return CHARS[Math.abs(h) % CHARS.length]
  },
  posesOf: (char) => Object.keys(SPRITES[char] ?? {}).sort(),
  defaultPoseOf,
  // 寶可夢沒有裸素體問題,全部姿勢都能輪播
  clothedPosesOf: (char) => Object.keys(SPRITES[char] ?? {}).sort(),
  spriteUrl: (char, pose) => SPRITES[char]?.[pose] ?? SPRITES[char]?.[defaultPoseOf(char)],
  poseScale: (char, pose) => (CHAR_SIZES[char]?.[pose] ?? BASE_CELL) / BASE_CELL,
  // 體型差:大隻的本體就是大,內容貼底——底部對齊,下緣才與小隻齊平不壓名條
  oversizeAnchor: 'bottom',
}

export default pokemon

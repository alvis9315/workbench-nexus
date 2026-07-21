import type { SpriteTheme } from '@/themes/types'

// 「冒險者公會」主題:LPC sprite(前身 src/data/lpcSprites.ts)。
// 素材:assets/themes/guild/<char>/<pose>.gif(透明去背),正本在 ~/ui-asset-library;
// 各角色的 LPC 產生器設定檔在同資料夾 meta.json。掃檔動態建表,不寫死姿勢清單。
const modules = import.meta.glob('../../assets/themes/guild/*/*.gif', {
  eager: true,
  import: 'default',
}) as Record<string, string>

/** char_id -> pose -> url */
const SPRITES: Record<string, Record<string, string>> = {}
for (const [path, url] of Object.entries(modules)) {
  const m = path.match(/guild\/([^/]+)\/([^/]+)\.gif$/)
  if (!m) continue
  ;(SPRITES[m[1]] ??= {})[m[2]] = url
}

const CHARS = Object.keys(SPRITES).sort()

// meta.json 記錄各角色 LPC 產生器設定,含顯示名與 oversize 武器的格子尺寸(px)
const metas = import.meta.glob('../../assets/themes/guild/*/meta.json', {
  eager: true,
  import: 'default',
}) as Record<string, { display_name?: string; oversize_weapon_cell?: number }>

const OVERSIZE_CELL: Record<string, number> = {}
const CHAR_LABEL: Record<string, string> = {}
for (const [path, meta] of Object.entries(metas)) {
  const m = path.match(/guild\/([^/]+)\/meta\.json$/)
  if (!m) continue
  if (meta.oversize_weapon_cell) OVERSIZE_CELL[m[1]] = meta.oversize_weapon_cell
  if (meta.display_name) CHAR_LABEL[m[1]] = meta.display_name
}

/** skill id(=seed)→ 角色。配對可隨意調整;沒列到的 skill 用 seed hash 決定性分配。 */
const SKILL_CHAR: Record<string, string> = {
  'work-shift': 'A_sword_red', // 排班值班 → 站哨劍士
  'resume-tailoring': 'C_kimono_pink', // 客製剪裁 → 和服
  'self-prompting': 'E_sage_white', // 詠唱 prompt → 法師
  'new-project-quickstart': 'D_paladin_blonde', // 開荒先鋒 → 聖騎
  'design-system-codify': 'B_catgirl_blue',
  'api-sa-merge': 'F_archer_orange', // 精準打點 → 弓手
  mascot: 'D_paladin_blonde', // 角落小幫手的出廠角色
}

/** 各角色的預設姿勢:挑「全裝」動作(部分服裝圖層不支援 idle,會變裸素體)。 */
const DEFAULT_POSE: Record<string, string> = {
  A_sword_red: 'walk_down',
  B_catgirl_blue: 'idle_down',
  C_kimono_pink: 'idle_down',
  D_paladin_blonde: 'walk_down',
  E_sage_white: 'idle_down',
  F_archer_orange: 'idle_down',
}

/** 職業分類(選角彈窗頁籤) */
const CHAR_GROUP: Record<string, string> = {
  A_sword_red: 'sword',
  D_paladin_blonde: 'paladin',
  E_sage_white: 'mage',
  B_catgirl_blue: 'archer',
  F_archer_orange: 'archer',
  C_kimono_pink: 'folk',
}

const defaultPoseOf = (char: string): string => {
  const poses = SPRITES[char] ?? {}
  return DEFAULT_POSE[char] in poses ? DEFAULT_POSE[char] : (Object.keys(poses)[0] ?? '')
}

// numeric:true → r2 排在 r10 前面,不會出現 r1, r10, r11, …, r2 的字典序
const posesOf = (char: string): string[] =>
  Object.keys(SPRITES[char] ?? {}).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

const guild: SpriteTheme = {
  id: 'guild',
  label: '冒險者公會',
  chars: CHARS,
  charLabel: (char) => CHAR_LABEL[char] ?? char,
  groups: [
    { id: 'sword', label: '劍士' },
    { id: 'paladin', label: '聖騎' },
    { id: 'mage', label: '法師' },
    { id: 'archer', label: '弓手' },
    { id: 'folk', label: '旅人' },
  ],
  charGroupOf: (char) => CHAR_GROUP[char] ?? 'folk',
  charForSeed: (seed) => {
    if (SKILL_CHAR[seed] && SPRITES[SKILL_CHAR[seed]]) return SKILL_CHAR[seed]
    if (!CHARS.length) return ''
    let h = 0
    for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0
    return CHARS[Math.abs(h) % CHARS.length]
  },
  posesOf,
  defaultPoseOf,
  /** 「有穿衣服」:DEFAULT_POSE 非 idle 的角色代表其服裝圖層不支援 idle(會變裸素體),
   *  隨機輪播時濾掉 idle 系動作。啟發式;素材 metadata 補齊後改讀 meta.json。 */
  clothedPosesOf: (char) => {
    const poses = posesOf(char)
    if (DEFAULT_POSE[char]?.startsWith('idle')) return poses
    return poses.filter((p) => !p.includes('idle'))
  },
  spriteUrl: (char, pose) => SPRITES[char]?.[pose] ?? SPRITES[char]?.[defaultPoseOf(char)],
  /** 標準 LPC 格 64px;oversize 武器姿勢的格更大(如 192)。
   *  顯示尺寸乘上倍率,人物比例才與其他姿勢一致,武器自然超出格外。 */
  poseScale: (char, pose) =>
    pose.startsWith('weapon_oversize') ? (OVERSIZE_CELL[char] ?? 192) / 64 : 1,
}

export default guild

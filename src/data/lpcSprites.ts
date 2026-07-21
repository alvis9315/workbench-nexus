// LPC sprite 素材索引:掃 assets/sprites/<char>/<pose>.gif 動態建表,不寫死姿勢清單
// (各角色姿勢數量不同:54-66 種)。素材正本在 ~/ui-asset-library/custom/sprites/,
// 這裡是透明去背後的複製件;各角色的 LPC 產生器設定檔在同資料夾 meta.json。
const modules = import.meta.glob('../assets/sprites/*/*.gif', {
  eager: true,
  import: 'default',
}) as Record<string, string>

/** char_id -> pose -> url */
export const SPRITES: Record<string, Record<string, string>> = {}
for (const [path, url] of Object.entries(modules)) {
  const m = path.match(/sprites\/([^/]+)\/([^/]+)\.gif$/)
  if (!m) continue
  ;(SPRITES[m[1]] ??= {})[m[2]] = url
}

export const CHARS = Object.keys(SPRITES).sort()

/** skill id(=seed)→ 角色。配對可隨意調整;沒列到的 skill 用 seed hash 決定性分配。 */
export const SKILL_CHAR: Record<string, string> = {
  'work-shift': 'A_sword_red', // 排班值班 → 站哨劍士
  'resume-tailoring': 'C_kimono_pink', // 客製剪裁 → 和服
  'self-prompting': 'E_sage_white', // 詠唱 prompt → 法師
  'new-project-quickstart': 'D_paladin_blonde', // 開荒先鋒 → 聖騎
  'design-system-codify': 'B_catgirl_blue',
  'api-sa-merge': 'F_archer_orange', // 精準打點 → 弓手
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

export const charForSeed = (seed: string): string => {
  if (SKILL_CHAR[seed] && SPRITES[SKILL_CHAR[seed]]) return SKILL_CHAR[seed]
  if (!CHARS.length) return ''
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0
  return CHARS[Math.abs(h) % CHARS.length]
}

export const posesOf = (char: string): string[] => Object.keys(SPRITES[char] ?? {}).sort()

export const defaultPoseOf = (char: string): string => {
  const poses = SPRITES[char] ?? {}
  return DEFAULT_POSE[char] in poses ? DEFAULT_POSE[char] : (Object.keys(poses)[0] ?? '')
}

export const spriteUrl = (char: string, pose: string): string | undefined =>
  SPRITES[char]?.[pose] ?? SPRITES[char]?.[defaultPoseOf(char)]

import type { SpriteSlot, SpriteTheme, ThemeManifest } from '@/themes/types'
import castingData from '@/data/casting.json'

// manifest → SpriteTheme 共用 factory(theme-mainline-v2 §3.1/§3.2):
// 主題模組只負責「glob 素材 URL + import characters.json + 宣告錨定方式」,
// 其餘行為全由 manifest 資料驅動——新主題不再重寫選角/分組/尺寸邏輯。
// 選角(seed→角色)讀 casting.json 跨主題層;沒登記的 seed 用 hash 決定性分配。

const casting = castingData as unknown as Record<string, Record<string, string>>

const hashPick = (seed: string, chars: string[]): string => {
  if (!chars.length) return ''
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0
  return chars[Math.abs(h) % chars.length]
}

export const createManifestTheme = (
  manifest: ThemeManifest,
  spriteUrls: Record<string, Record<string, string>>,
  opts: { oversizeAnchor: SpriteTheme['oversizeAnchor'] },
): SpriteTheme => {
  const byId = new Map(manifest.characters.map((c) => [c.id, c]))
  // manifest 順序即選角彈窗順序(產生腳本已按 order/id 排好)
  const chars = manifest.characters.map((c) => c.id)

  const defaultPoseOf = (char: string): string => {
    const c = byId.get(char)
    if (c && spriteUrls[char]?.[c.default_pose]) return c.default_pose
    return Object.keys(spriteUrls[char] ?? {})[0] ?? ''
  }

  return {
    id: manifest.theme_id,
    shareable: manifest.shareable,
    label: manifest.theme_name,
    chars,
    charLabel: (char) => byId.get(char)?.label ?? char,
    groups: manifest.groups,
    charGroupOf: (char) => byId.get(char)?.group ?? manifest.fallback_group,
    charForSeed: (seed) => {
      const cast = casting[seed]?.[manifest.theme_id]
      if (cast && byId.has(cast)) return cast
      return hashPick(seed, chars)
    },
    posesOf: (char) => byId.get(char)?.poses ?? Object.keys(spriteUrls[char] ?? {}).sort(),
    defaultPoseOf,
    clothedPosesOf: (char) => {
      const c = byId.get(char)
      const poses = c?.poses ?? []
      // idle_unsafe(服裝圖層不支援 idle → 裸素體)的角色,輪播濾掉 idle 系姿勢
      return c?.idle_unsafe ? poses.filter((p) => !p.includes('idle')) : poses
    },
    spriteUrl: (char, pose) => spriteUrls[char]?.[pose] ?? spriteUrls[char]?.[defaultPoseOf(char)],
    poseScale: (char, pose) => (byId.get(char)?.pose_cells[pose] ?? manifest.base_cell) / manifest.base_cell,
    oversizeAnchor: opts.oversizeAnchor,
    slotPose: (char, slot: SpriteSlot) => byId.get(char)?.slots[slot] ?? defaultPoseOf(char),
    charFrame: (char) => {
      const c = byId.get(char)
      return { w: c?.frame_w ?? manifest.base_cell, h: c?.frame_h ?? manifest.base_cell }
    },
  }
}

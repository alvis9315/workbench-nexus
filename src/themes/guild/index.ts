import type { ThemeManifest } from '@/themes/types'
import { createManifestTheme } from '@/themes/manifest'
import manifest from '../../assets/themes/guild/characters.json'

// 「冒險者公會」主題:LPC sprite,素材正本在 ~/ui-asset-library(產線見其 docs)。
// 素材是 strip PNG(2026-07-22 起,PixelSprite steps 播放;GIF 已退役),
// 角色資料全在 characters.json(scripts/gen-theme-manifest.mjs 從 meta.json+檔頭產生)——
// 新增角色 = 放素材資料夾 + 補 meta.json + 重跑腳本,本模組零改動。
const modules = import.meta.glob('../../assets/themes/guild/*/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

/** char_id -> pose -> url */
const SPRITES: Record<string, Record<string, string>> = {}
for (const [path, url] of Object.entries(modules)) {
  const m = path.match(/guild\/([^/]+)\/([^/]+)\.png$/)
  if (!m) continue
  ;(SPRITES[m[1]] ??= {})[m[2]] = url
}

// 武器大格:角色仍在畫布中央,只有武器四向溢出——置中錨定,人物才不會上飄
export default createManifestTheme(manifest as unknown as ThemeManifest, SPRITES, {
  oversizeAnchor: 'center',
})

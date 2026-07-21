import type { ThemeManifest } from '@/themes/types'
import { createManifestTheme } from '@/themes/manifest'
import manifest from '../../assets/themes/pokemon/characters.json'

// 「寶可夢圖鑑」主題:素材由 scripts/import-pokemon.mjs 從 vscode-pokemon repo 匯入。
// ⚠️ 圖像是任天堂/Game Freak IP,僅限本機自用,不得公開部署(manifest shareable: false)。
// 角色資料全在 characters.json(圖鑑序/世代/尺寸由 gen-theme-manifest.mjs 從 meta.json 產生)。
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

// 體型差:大隻的本體就是大,內容貼底——底部對齊,下緣才與小隻齊平不壓名條
export default createManifestTheme(manifest as ThemeManifest, SPRITES, {
  oversizeAnchor: 'bottom',
})

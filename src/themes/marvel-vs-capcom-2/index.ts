import type { ThemeManifest } from '@/themes/types'
import { createManifestTheme } from '@/themes/manifest'
import manifest from '../../assets/themes/marvel-vs-capcom-2/characters.json'

// MVC2 私用主題。素材正本、來源與抽取列記錄在 ui-asset-library；此處只放
// Workbench runtime 需要的四語意 strip。
const modules = import.meta.glob('../../assets/themes/marvel-vs-capcom-2/*/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const SPRITES: Record<string, Record<string, string>> = {}
for (const [path, url] of Object.entries(modules)) {
  const match = path.match(/marvel-vs-capcom-2\/([^/]+)\/([^/]+)\.png$/)
  if (!match) continue
  ;(SPRITES[match[1]] ??= {})[match[2]] = url
}

export default createManifestTheme(manifest as unknown as ThemeManifest, SPRITES, {
  oversizeAnchor: 'center',
})

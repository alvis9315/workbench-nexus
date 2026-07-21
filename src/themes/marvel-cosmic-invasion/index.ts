import type { ThemeManifest } from '@/themes/types'
import { createManifestTheme } from '@/themes/manifest'
import manifest from '../../assets/themes/marvel-cosmic-invasion/characters.json'

// Marvel: Cosmic Invasion 私用主題。素材正本與完整授權邊界在
// ~/ui-asset-library/custom/sprites/marvel/；本 repo 只放正規化後四語意 strip。
const modules = import.meta.glob('../../assets/themes/marvel-cosmic-invasion/*/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const SPRITES: Record<string, Record<string, string>> = {}
for (const [path, url] of Object.entries(modules)) {
  const match = path.match(/marvel-cosmic-invasion\/([^/]+)\/([^/]+)\.png$/)
  if (!match) continue
  ;(SPRITES[match[1]] ??= {})[match[2]] = url
}

export default createManifestTheme(manifest as unknown as ThemeManifest, SPRITES, {
  oversizeAnchor: 'center',
})


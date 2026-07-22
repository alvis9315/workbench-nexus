import type { ThemeManifest } from '@/themes/types'
import { createManifestTheme } from '@/themes/manifest'
import manifest from '../../assets/themes/neon-protocol/characters.json'

const modules = import.meta.glob('../../assets/themes/neon-protocol/*/*.gif', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const SPRITES: Record<string, Record<string, string>> = {}
for (const [path, url] of Object.entries(modules)) {
  const match = path.match(/neon-protocol\/([^/]+)\/([^/]+)\.gif$/)
  if (!match) continue
  ;(SPRITES[match[1]] ??= {})[match[2]] = url
}

export default createManifestTheme(manifest as unknown as ThemeManifest, SPRITES, {
  oversizeAnchor: 'center',
})

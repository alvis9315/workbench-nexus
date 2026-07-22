#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const defaultDataRoot = resolve(
  ROOT,
  '../../ui-asset-library/custom/sprites/marvel/mvc2-data',
)
const dataRoot = resolve(process.env.MVC2_DATA_ROOT ?? defaultDataRoot)
const catalogPath = join(dataRoot, 'parsed/spider-man-pose-catalog.json')
const targetDir = join(ROOT, 'src/assets/themes/marvel-vs-capcom-2/spider-man')

if (!existsSync(catalogPath)) {
  throw new Error(`找不到 Spider-Man pose catalog: ${catalogPath}`)
}

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'))
const ready = catalog.records.filter((record) => record.selector_ready)
mkdirSync(targetDir, { recursive: true })

let copied = 0
for (const record of ready) {
  if (!record.animation_gif_path) continue
  const source = join(dataRoot, record.animation_gif_path)
  if (!existsSync(source)) {
    throw new Error(`catalog 標示 ready，但來源檔不存在: ${source}`)
  }
  copyFileSync(source, join(targetDir, `${record.pose_key}.gif`))
  copied += 1
}

console.log(
  `MVC2 Spider-Man:同步 ${copied}/${catalog.count} 個已驗證下載的 pose；` +
  `${catalog.pending_download_count} 個仍待 collector 續抓。`,
)

#!/usr/bin/env node
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
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

const keyOverrides = new Map([
  ['spider-man-g00-a000', 'source-neutral-cycle'],
  ['spider-man-g00-a002', 'source-walk-backward'],
  ['spider-man-g00-a003', 'source-walk-forward'],
])
const catalogFileNames = new Set(catalog.records.map((record) => `${record.pose_key}.gif`))
for (const file of readdirSync(targetDir)) {
  if ((file.startsWith('source-') && file.endsWith('.gif')) || catalogFileNames.has(file)) {
    unlinkSync(join(targetDir, file))
  }
}

let copied = 0
const poseLabels = {}
for (const record of ready) {
  if (!record.animation_gif_path) continue
  const source = join(dataRoot, record.animation_gif_path)
  if (!existsSync(source)) {
    throw new Error(`catalog 標示 ready，但來源檔不存在: ${source}`)
  }
  const poseKey = keyOverrides.get(record.animation_id) ?? `source-${record.pose_key}`
  copyFileSync(source, join(targetDir, `${poseKey}.gif`))
  poseLabels[poseKey] = record.selector_label ?? record.display_label
  copied += 1
}
writeFileSync(join(targetDir, 'pose-labels.json'), `${JSON.stringify(poseLabels, null, 2)}\n`)

console.log(
  `MVC2 Spider-Man:同步 ${copied}/${catalog.count} 個不重複 pose；` +
  `${catalog.pending_download_count} 個仍待 collector 續抓。`,
)

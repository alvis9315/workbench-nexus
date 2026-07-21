#!/usr/bin/env node
/**
 * 從 ui-asset-library 的 Marvel 正規化素材匯入私用主題。
 * 用法:node scripts/import-marvel-cosmic-invasion.mjs [ui-asset-library 路徑]
 * 預設來源:~/ui-asset-library（只在本機可解析；repo 不建立跨目錄 runtime 依賴）。
 *
 * ⚠️ Marvel 第三方 IP，只限私人、未發布、非商業使用；主題必須 shareable:false。
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { homedir } from 'node:os'

const srcRepo = resolve(process.argv[2] ?? join(homedir(), 'ui-asset-library'))
const srcRoot = join(srcRepo, 'custom/sprites/marvel/normalized/cosmic-invasion')
const outRoot = resolve(import.meta.dirname, '../src/assets/themes/marvel-cosmic-invasion')

if (!existsSync(srcRoot)) {
  console.error(`找不到正規化素材:${srcRoot}`)
  process.exit(1)
}

mkdirSync(outRoot, { recursive: true })
let characters = 0
let assets = 0
for (const entry of readdirSync(srcRoot, { withFileTypes: true })) {
  const src = join(srcRoot, entry.name)
  const out = join(outRoot, entry.name)
  if (entry.isDirectory()) {
    cpSync(src, out, { recursive: true, force: true })
    characters++
    assets += readdirSync(src).filter((file) => file.endsWith('.png')).length
  } else if (entry.name === 'icon.png') {
    cpSync(src, out)
  }
}

console.log(`匯入完成:${characters} 個外觀、${assets} 張 strip → ${outRoot}`)


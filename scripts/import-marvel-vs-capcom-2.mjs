#!/usr/bin/env node
/**
 * 從 ui-asset-library 匯入已正規化的 MVC2 私用主題。
 * 用法：node scripts/import-marvel-vs-capcom-2.mjs [ui-asset-library 路徑]
 * ⚠️ Marvel／Capcom 第三方 IP；只限私人、未發布、非商業使用。
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { homedir } from 'node:os'

const srcRepo = resolve(process.argv[2] ?? join(homedir(), 'ui-asset-library'))
const srcRoot = join(srcRepo, 'custom/sprites/marvel/normalized/mvc2')
const outRoot = resolve(import.meta.dirname, '../src/assets/themes/marvel-vs-capcom-2')

if (!existsSync(srcRoot)) {
  console.error(`找不到正規化素材：${srcRoot}`)
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

console.log(`匯入完成：${characters} 位角色、${assets} 張 strip → ${outRoot}`)

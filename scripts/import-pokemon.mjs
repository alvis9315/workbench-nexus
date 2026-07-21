#!/usr/bin/env node
/**
 * 從 vscode-pokemon repo 匯入寶可夢素材成 pokemon 主題包。
 * 用法:node scripts/import-pokemon.mjs <vscode-pokemon 路徑> [gen1,gen2,…(預設全部)]
 *
 * 來源結構:media/<gen>/<pokemon>/{default_idle,default_walk,shiny_idle,shiny_walk}_8fps.gif
 * 產出:src/assets/themes/pokemon/<pokemon>/{idle,walk,shiny_idle,shiny_walk}.gif + meta.json
 *
 * ⚠️ 授權:vscode-pokemon 程式碼是 MIT,但寶可夢圖像是任天堂/Creatures/Game Freak 的 IP,
 *    僅限本機自用;此 repo 不得轉 public、含此素材的版本不得公開部署。
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const [, , srcRoot, gensArg] = process.argv
if (!srcRoot) {
  console.error('用法:node scripts/import-pokemon.mjs <vscode-pokemon 路徑> [gen1,gen2,…]')
  process.exit(1)
}
const GENS = gensArg ? gensArg.split(',') : ['gen1', 'gen2', 'gen3', 'gen4']
const mediaDir = resolve(srcRoot, 'media')
const outRoot = resolve(import.meta.dirname, '../src/assets/themes/pokemon')

const POSE_MAP = {
  default_idle_8fps: 'idle',
  default_walk_8fps: 'walk',
  shiny_idle_8fps: 'shiny_idle',
  shiny_walk_8fps: 'shiny_walk',
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// GIF 檔頭 bytes 6-9 = 寬/高(LE)。官方素材尺寸不一(Lugia 64px、多數 32px),
// 尺寸寫進 meta 讓主題按原生比例呈現大小差異
const gifSize = (path) => {
  const buf = readFileSync(path)
  return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) }
}

// 圖鑑編號與正式顯示名:來源 repo 的 src/common/pokemon-data.ts(regex 淺解析,不執行 TS)
const DEX = {}
const dataFile = resolve(srcRoot, 'src/common/pokemon-data.ts')
if (existsSync(dataFile)) {
  const src = readFileSync(dataFile, 'utf8')
  for (const m of src.matchAll(/(\w+):\s*\{\s*id:\s*(\d+),\s*name:\s*'([^']+)'/g)) {
    DEX[m[1]] = { dex: Number(m[2]), name: m[3] }
  }
  console.log(`讀到 ${Object.keys(DEX).length} 筆圖鑑資料(編號+顯示名)`)
} else {
  console.warn('找不到 pokemon-data.ts,meta 將缺 dex 編號')
}

let chars = 0
let gifs = 0
for (const gen of GENS) {
  const genDir = join(mediaDir, gen)
  if (!existsSync(genDir)) {
    console.error(`略過 ${gen}:找不到 ${genDir}`)
    continue
  }
  for (const name of readdirSync(genDir)) {
    const srcDir = join(genDir, name)
    const files = readdirSync(srcDir).filter((f) => f.endsWith('.gif'))
    if (!files.length) continue
    const outDir = join(outRoot, name)
    mkdirSync(outDir, { recursive: true })
    const sizes = {}
    for (const f of files) {
      const pose = POSE_MAP[f.replace(/\.gif$/, '')]
      if (!pose) continue
      cpSync(join(srcDir, f), join(outDir, `${pose}.gif`))
      sizes[pose] = Math.max(gifSize(join(srcDir, f)).w, gifSize(join(srcDir, f)).h)
      gifs++
    }
    writeFileSync(
      join(outDir, 'meta.json'),
      JSON.stringify(
        {
          display_name: DEX[name]?.name ?? cap(name),
          dex: DEX[name]?.dex ?? null,
          generation: gen,
          sizes,
          source: 'https://github.com/jakobhoeg/vscode-pokemon',
          license: 'Pokémon © Nintendo/Creatures/Game Freak — 僅限本機自用,不得公開部署',
        },
        null,
        2,
      ) + '\n',
    )
    chars++
  }
}
console.log(`匯入完成:${chars} 隻、${gifs} 張 GIF → ${outRoot}`)

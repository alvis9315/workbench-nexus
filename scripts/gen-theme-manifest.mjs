#!/usr/bin/env node
// 主題 manifest 產生器(theme-mainline-v2 §3.1):
// 掃 src/assets/themes/<id>/<char>/*.gif + meta.json → 產 characters.json。
// UI 只讀 manifest 渲染;素材或 meta 有變動時重跑本腳本(不手改 characters.json 的
// characters 區塊——會被重生覆蓋;要改角色資料改 meta.json)。
// 用法:node scripts/gen-theme-manifest.mjs [guild|pokemon|全部省略=兩者]
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const THEMES_DIR = join(ROOT, 'src/assets/themes')

// 主題層設定(不屬於單一角色的資料;新主題在此加一段)
const THEME_CONFIG = {
  guild: {
    theme_name: '冒險者公會',
    shareable: true,
    credits: 'LPC CC-BY/OGA-BY;逐層署名見 ui-asset-library CREDITS.md(補齊中)',
    base_cell: 64,
    groups: [
      { id: 'sword', label: '劍士' },
      { id: 'paladin', label: '聖騎' },
      { id: 'mage', label: '法師' },
      { id: 'archer', label: '弓手' },
      { id: 'folk', label: '旅人' },
    ],
    fallback_group: 'folk',
    // 語意槽位的候選姿勢(依序找第一個存在的;idle 槽尊重 default_pose 的裸素體判斷)
    slots: {
      idle: ['idle_down', 'walk_down'],
      hover: ['run_down', 'walk_down'],
      grab: ['jump_down', 'walk_down'],
      action: ['slash_down', 'thrust_down', 'shoot_down', 'walk_down'],
    },
    // meta.json 欄位對映
    charFromMeta: (meta, poses) => {
      const defaultPose = poses.includes(meta.default_pose) ? meta.default_pose : poses[0]
      const poseCells = {}
      if (meta.oversize_weapon_cell)
        for (const p of poses)
          if (p.startsWith('weapon_oversize')) poseCells[p] = meta.oversize_weapon_cell
      return {
        label: meta.display_name,
        group: meta.group,
        default_pose: defaultPose,
        // 服裝圖層不支援 idle 的角色(default_pose 非 idle 系)→ idle 是裸素體,輪播要濾掉
        idle_unsafe: !String(defaultPose).startsWith('idle'),
        pose_cells: poseCells,
        order: null,
      }
    },
  },
  pokemon: {
    theme_name: '寶可夢圖鑑',
    shareable: false,
    credits: '任天堂/Creatures/Game Freak IP,僅限本機自用,不得公開部署',
    base_cell: 32,
    groups: [
      { id: 'gen1', label: '一世代' },
      { id: 'gen2', label: '二世代' },
      { id: 'gen3', label: '三世代' },
      { id: 'gen4', label: '四世代' },
    ],
    fallback_group: 'gen1',
    slots: {
      idle: ['idle', 'walk'],
      hover: ['walk', 'idle'],
      grab: ['walk', 'idle'],
      action: ['shiny_idle', 'idle', 'walk'],
    },
    charFromMeta: (meta, poses) => ({
      label: meta.display_name,
      group: meta.generation,
      default_pose: poses.includes('idle') ? 'idle' : poses[0],
      idle_unsafe: false,
      pose_cells: Object.fromEntries(
        Object.entries(meta.sizes ?? {}).filter(([p]) => poses.includes(p)),
      ),
      order: meta.dex ?? null,
    }),
  },
}

const resolveSlots = (slotConfig, poses, defaultPose, idleUnsafe) => {
  const slots = {}
  for (const [slot, candidates] of Object.entries(slotConfig)) {
    let pose = candidates.find((c) => poses.includes(c))
    // idle 槽:裸素體角色不能用 idle 系姿勢,退回 default_pose(已保證安全)
    if (slot === 'idle' && idleUnsafe) pose = defaultPose
    slots[slot] = pose ?? defaultPose
  }
  return slots
}

const genTheme = (themeId) => {
  const cfg = THEME_CONFIG[themeId]
  if (!cfg) throw new Error(`未知主題 ${themeId}(THEME_CONFIG 先加設定)`)
  const dir = join(THEMES_DIR, themeId)
  const characters = []
  for (const charId of readdirSync(dir).sort()) {
    const charDir = join(dir, charId)
    const metaPath = join(charDir, 'meta.json')
    if (!existsSync(metaPath)) continue
    const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
    const poses = readdirSync(charDir)
      .filter((f) => f.endsWith('.gif'))
      .map((f) => f.replace(/\.gif$/, ''))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    if (!poses.length) continue
    const c = cfg.charFromMeta(meta, poses)
    // 只保留與基準格不同的尺寸(等於基準的寫進去只是佔空間)
    c.pose_cells = Object.fromEntries(
      Object.entries(c.pose_cells ?? {}).filter(([, cell]) => cell !== cfg.base_cell),
    )
    characters.push({
      id: charId,
      label: c.label ?? charId,
      group: c.group ?? cfg.fallback_group,
      order: c.order,
      frame_w: cfg.base_cell,
      frame_h: cfg.base_cell,
      default_pose: c.default_pose,
      idle_unsafe: c.idle_unsafe,
      pose_cells: c.pose_cells,
      poses,
      slots: resolveSlots(cfg.slots, poses, c.default_pose, c.idle_unsafe),
    })
  }
  characters.sort(
    (a, b) => (a.order ?? 9999) - (b.order ?? 9999) || a.id.localeCompare(b.id),
  )
  const manifest = {
    theme_id: themeId,
    theme_name: cfg.theme_name,
    shareable: cfg.shareable,
    credits: cfg.credits,
    base_cell: cfg.base_cell,
    groups: cfg.groups,
    fallback_group: cfg.fallback_group,
    characters,
  }
  const out = join(dir, 'characters.json')
  writeFileSync(out, JSON.stringify(manifest, null, 2) + '\n')
  console.log(`${themeId}: ${characters.length} 角色 → ${out}`)
}

const targets = process.argv.slice(2)
for (const t of targets.length ? targets : Object.keys(THEME_CONFIG)) genTheme(t)

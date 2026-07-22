#!/usr/bin/env node
// 主題 manifest 產生器(theme-mainline-v2 §3.1):
// 掃 src/assets/themes/<id>/<char>/*.gif + meta.json → 產 characters.json。
// UI 只讀 manifest 渲染;素材或 meta 有變動時重跑本腳本(不手改 characters.json 的
// characters 區塊——會被重生覆蓋;要改角色資料改 meta.json)。
// 用法:node scripts/gen-theme-manifest.mjs [guild|pokemon|marvel-cosmic-invasion|marvel-vs-capcom-2|全部省略]
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const THEMES_DIR = join(ROOT, 'src/assets/themes')

// LPC 各動作的每格毫秒(lpc2gif ANIMS 表同源;最長前綴匹配)
const LPC_POSE_MS = {
  spellcast: 110, thrust: 100, walk: 120, slash: 110, shoot: 90,
  hurt: 150, climb: 150, idle: 450, jump: 130, sit: 350, emote: 300,
  run: 100, combat_idle: 400, backslash: 90, halfslash: 110, weapon_oversize: 110,
}
const poseMs = (pose) => {
  let best = 120
  let bestLen = -1
  for (const [prefix, ms] of Object.entries(LPC_POSE_MS))
    if (pose.startsWith(prefix) && prefix.length > bestLen) { best = ms; bestLen = prefix.length }
  return best
}

// PNG IHDR:寬高在位元組 16-23(big-endian)——strip 的 cell=高、frames=寬/高
const pngSize = (path) => {
  const buf = readFileSync(path)
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
}

// 主題層設定(不屬於單一角色的資料;新主題在此加一段)
const THEME_CONFIG = {
  guild: {
    theme_name: '冒險者公會',
    shareable: true,
    credits: 'LPC 逐圖層授權與作者署名見 src/assets/themes/guild/CREDITS.md',
    asset_kind: 'strip',
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
      grab: ['hurt_down', 'jump_down', 'walk_down'],
      action: ['slash_down', 'thrust_down', 'shoot_down', 'walk_down'],
    },
    // meta.json 欄位對映(strip 主題:cell/frames 由 genTheme 從 PNG 檔頭解析,不吃 meta)
    charFromMeta: (meta, poses) => {
      const defaultPose = poses.includes(meta.default_pose) ? meta.default_pose : poses[0]
      return {
        label: meta.display_name,
        group: meta.group,
        default_pose: defaultPose,
        // 服裝圖層不支援 idle 的角色(default_pose 非 idle 系)→ idle 是裸素體,輪播要濾掉
        idle_unsafe: !String(defaultPose).startsWith('idle'),
        pose_cells: {},
        order: null,
      }
    },
  },
  pokemon: {
    theme_name: '寶可夢圖鑑',
    shareable: false,
    credits: '任天堂/Creatures/Game Freak IP,僅限本機自用,不得公開部署',
    asset_kind: 'gif',
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
  'marvel-cosmic-invasion': {
    theme_name: 'Marvel: Cosmic Invasion',
    shareable: false,
    credits: 'Marvel 第三方 IP + The Spriters Resource 遊戲素材；僅限私人未發布非商業使用，禁止公開展示',
    asset_kind: 'strip',
    base_cell: 96,
    groups: [
      { id: 'spider', label: 'Spider-Verse' },
      { id: 'symbiote', label: 'Symbiote' },
    ],
    fallback_group: 'spider',
    slots: {
      idle: ['idle'],
      hover: ['hover', 'idle'],
      grab: ['grab', 'idle'],
      action: ['action', 'idle'],
    },
    charFromMeta: (meta, poses) => ({
      label: meta.display_name,
      group: meta.group,
      default_pose: poses.includes(meta.default_pose) ? meta.default_pose : poses[0],
      idle_unsafe: false,
      pose_cells: {},
      order: meta.order ?? null,
    }),
  },
  'marvel-vs-capcom-2': {
    theme_name: 'Marvel vs. Capcom 2 · Restoration WIP',
    shareable: false,
    credits: 'Marvel／Capcom 第三方 IP + The Spriters Resource 遊戲素材；四槽為可操作原型，完整招式還原中；僅限私人未發布非商業使用，禁止公開展示',
    asset_kind: 'strip',
    base_cell: 160,
    groups: [
      { id: 'x-men', label: 'X-Men' },
      { id: 'heroes', label: 'Marvel Heroes' },
      { id: 'rivals', label: 'Rivals & Villains' },
    ],
    fallback_group: 'rivals',
    slots: {
      idle: ['idle'],
      hover: ['hover', 'idle'],
      grab: ['grab', 'idle'],
      action: ['action', 'idle'],
    },
    charFromMeta: (meta, poses) => ({
      label: meta.display_name,
      group: meta.group,
      default_pose: poses.includes(meta.default_pose) ? meta.default_pose : poses[0],
      idle_unsafe: false,
      pose_cells: {},
      order: meta.order ?? null,
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
    const isStrip = cfg.asset_kind === 'strip'
    const files = readdirSync(charDir).filter((f) => f.endsWith(isStrip ? '.png' : '.gif'))
    const poses = files
      .map((f) => f.replace(/\.(gif|png)$/, ''))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    if (!poses.length) continue
    const c = cfg.charFromMeta(meta, poses)
    const poseFrames = {}
    const poseMsMap = {}
    if (isStrip) {
      // strip 檔頭即 metadata:cell=高、frames=寬/高;毫秒查 LPC 動作表
      for (const pose of poses) {
        const { w, h } = pngSize(join(charDir, `${pose}.png`))
        if (h !== cfg.base_cell) c.pose_cells[pose] = h
        poseFrames[pose] = Math.max(1, Math.round(w / h))
        poseMsMap[pose] = poseMs(pose)
      }
    }
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
      ...(isStrip ? { pose_frames: poseFrames, pose_ms: poseMsMap } : {}),
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
    asset_kind: cfg.asset_kind,
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

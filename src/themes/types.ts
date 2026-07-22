/** 語意槽位(theme-mainline-v2 §3.1):跨主題一致的角色動畫用途。
 *  idle=靜置、move=走路、hover=滑過/興奮、grab=被抓起、action=施展動作 */
export type SpriteSlot = 'idle' | 'move' | 'hover' | 'grab' | 'action'

/** 主題 manifest(characters.json,由 scripts/gen-theme-manifest.mjs 產生——
 *  改角色資料改 meta.json 後重跑腳本,不手改 manifest) */
export interface ThemeManifest {
  theme_id: string
  theme_name: string
  shareable: boolean
  credits: string
  /** 素材形式:'strip'=橫幅逐格 PNG(PixelSprite steps 播放)、'gif'=自帶動畫 */
  asset_kind: 'strip' | 'gif'
  /** 標準顯示格(px);pose_cells 記錄「不同於基準」的姿勢格尺寸 */
  base_cell: number
  groups: { id: string; label: string }[]
  fallback_group: string
  characters: ManifestCharacter[]
}

/** 單一姿勢的可渲染素材(PixelSprite 的輸入) */
export interface PoseAsset {
  url: string
  kind: 'strip' | 'gif'
  /** strip 幀數;gif 恆為 1(動畫在檔案裡) */
  frames: number
  /** strip 每格毫秒 */
  frameMs: number
  /** 該姿勢原生格尺寸(px) */
  cell: number
}

export interface ManifestCharacter {
  id: string
  label: string
  group: string
  /** 官方序(如圖鑑編號);null = 按 id 字典序排 */
  order: number | null
  frame_w: number
  frame_h: number
  default_pose: string
  /** true = idle 系姿勢是裸素體(服裝圖層不支援 idle),輪播與 idle 槽避開 */
  idle_unsafe: boolean
  /** 姿勢格尺寸覆寫(px),只記與 base_cell 不同者 → poseScale 依此計算 */
  pose_cells: Record<string, number>
  /** 卡片／小幫手用的每姿勢垂直視覺校正，單位為素材原生 px。 */
  pose_offset_y?: Record<string, number>
  /** strip 主題才有:各姿勢幀數(產生腳本從 PNG 檔頭解析) */
  pose_frames?: Record<string, number>
  /** strip 主題才有:各姿勢每格毫秒 */
  pose_ms?: Record<string, number>
  /** 混合素材主題可逐姿勢覆寫 asset_kind，例如 MVC2 的舊 PNG strip + 新 GIF。 */
  pose_kinds?: Record<string, 'strip' | 'gif'>
  poses: string[]
  /** 語意槽位 → 姿勢名(素材檔存在保證由產生腳本負責) */
  slots: Record<SpriteSlot, string>
}

/**
 * 主題(角色素材來源)的統一契約。所有元件只透過這個介面拿素材,
 * 不直接碰檔案——引入新來源=實作這個介面,流程見 docs/theme-source-spec.md。
 */
export interface SpriteTheme {
  /** kebab-case 唯一 id,也是 assets/themes/<id>/ 與 localStorage 分 key 的依據 */
  id: string
  /** 可公開性(theme-mainline-v2 §3.4):false = 含第三方 IP / 僅限私人使用——
   *  錄影、demo、放 portfolio 前不得切到此主題;UI 對 false 主題顯示「私用」標記 */
  shareable: boolean
  /** 顯示名(選主題選單用) */
  label: string
  /** 全部角色 id */
  chars: string[]
  /** 角色顯示名 */
  charLabel(char: string): string
  /** 分類頁籤(選角彈窗用,依序);單一分類也要給 */
  groups: { id: string; label: string }[]
  /** 角色屬於哪個分類 */
  charGroupOf(char: string): string
  /** seed(skill id / 'mascot')→ 出廠預設角色 */
  charForSeed(seed: string): string
  /** 角色的全部姿勢 */
  posesOf(char: string): string[]
  /** 角色的預設姿勢(必須是「安全」姿勢,如全裝不裸素體) */
  defaultPoseOf(char: string): string
  /** 適合隨機輪播的姿勢(小幫手動畫用) */
  clothedPosesOf(char: string): string[]
  /** 姿勢圖 URL;姿勢不存在時退回預設姿勢 */
  spriteUrl(char: string, pose: string): string | undefined
  /** 相對標準顯示框的倍率(>1 = 素材畫布較大,會做破格溢出效果) */
  poseScale(char: string, pose: string): number
  /** 將透明留白不對稱的姿勢校正回視覺中心，回傳素材原生 px。 */
  poseOffsetY(char: string, pose: string): number
  /** oversize(poseScale>1)素材的錨定方式,取決於素材畫布為什麼變大:
   *  'bottom'=體型差(角色本體就是大隻,內容貼底,底部對齊才與小隻齊平,如寶可夢 64px 大隻)
   *  'center'=動作格(角色仍在畫布中央,武器/特效四向溢出,置中才不會人物上飄,如公會武器大格) */
  oversizeAnchor: 'bottom' | 'center'
  /** 語意槽位 → 姿勢名(roster hover/夾娃娃機 grab/點擊 action 等跨主題互動用) */
  slotPose(char: string, slot: SpriteSlot): string
  /** 角色顯示框原生尺寸(px;非正方形直式角色 frame_h > frame_w) */
  charFrame(char: string): { w: number; h: number }
  /** 姿勢的可渲染素材(url + strip/gif + 幀數/速度/格尺寸)——元件一律經 PixelSprite 渲染 */
  poseAsset(char: string, pose: string): PoseAsset | undefined
}

/**
 * 主題(角色素材來源)的統一契約。所有元件只透過這個介面拿素材,
 * 不直接碰檔案——引入新來源=實作這個介面,流程見 docs/theme-source-spec.md。
 */
export interface SpriteTheme {
  /** kebab-case 唯一 id,也是 assets/themes/<id>/ 與 localStorage 分 key 的依據 */
  id: string
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
}

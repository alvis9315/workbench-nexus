/** skills.json 的一筆 skill(manifest 即 source of truth)。 */
export interface Skill {
  id: string
  name: string
  category: SkillCategory
  description: string
  triggerKeywords: string[]
  invocation: string
  seed: string
  pinned: boolean
  /** ready(可用)/ running(進行中)/ idle(閒置);未填視為 ready。 */
  status?: SkillStatus
  /** 使用流程:從啟動到拿到產出的步驟(給人看的操作地圖)。 */
  usage?: string[]
}

export type SkillCategory = 'frontend' | 'backend' | 'doc' | 'pipeline'
export type SkillStatus = 'ready' | 'running' | 'idle'

/** repos.json 的一筆 repo(手動維護的 GitHub 清單)。 */
export interface Repo {
  name: string
  url: string
  /** 一句話說明;練習類可省。 */
  description?: string
  category: RepoCategory
  visibility: 'public' | 'private'
  /** fork 來的參考 repo。 */
  fork?: boolean
}

export type RepoCategory = 'skill' | 'product' | 'research' | 'practice' | 'reference'

/** github-stars.json 的一筆:GitHub 帳號層級加星標的「別人的」repo(外部收藏,非自有)。 */
export interface StarredRepo {
  owner: string
  name: string
  url: string
  description: string
  language: string
}

/** projects.json 的一筆:~/Projects 下實際有頁面的系統(Stage Select 關卡磚)。
 * 三態(依欄位推導,不額外存 status):
 * - deployUrl 有值 → READY,點擊跳轉該連結
 * - deployUrl 為 null 但 startCommand 有值 → LOCAL,點擊複製啟動指令(貼終端機自己開;
 *   本機限定工具無法部署,也不貼假 localhost 連結——connect 到哪個 port 當下可能是別的專案)
 * - 皆無 → LOCKED,等擁有者補
 */
export interface Project {
  name: string
  folder: string
  description: string
  deployUrl: string | null
  repoUrl?: string
  /** 本機限定工具的啟動指令(多筆對應多個 terminal,依序執行)。 */
  startCommand?: string[]
}

/** ui-library.json 的一筆:~/UILibrary 收錄項。 */
export interface UiLibraryItem {
  name: string
  /** 內容類型(主分組軸):元件庫 / 3D 圖形 / agent skill / 動效素材 / 設計工具。 */
  category: UiLibraryCategory
  /** 誰做的(次要標籤,非分組軸):vendor 唯讀參考 / custom 自製正本。 */
  kind: 'vendor' | 'custom'
  /** custom 才有:vue / react / common。 */
  tech?: string
  description: string
  /** vendor 的上游 repo 或文件站;custom 可留本機路徑說明。 */
  url?: string
  license?: string
  /** 預覽圖路徑(public/ 下);未提供時卡片顯示樣式化佔位。 */
  preview?: string
}

export type UiLibraryCategory = 'components' | '3d' | 'agent-skill' | 'motion' | 'design-tool'

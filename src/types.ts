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

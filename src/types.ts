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
}

export type SkillCategory = 'frontend' | 'backend' | 'doc' | 'pipeline'
export type SkillStatus = 'ready' | 'running' | 'idle'

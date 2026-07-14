import { toast } from 'vue-sonner'
import { useLocalStorage } from '@vueuse/core'
import type { Skill } from '@/types'

/** 使用紀錄(EXT-002):每次複製調用記一筆,localStorage 上限 200。 */
export interface LaunchLogItem {
  skillId: string
  at: string // ISO
}

export const launchLog = useLocalStorage<LaunchLogItem[]>('wn-launch-log', [])

/**
 * 發射:複製 skill 的調用 prompt(發射台的核心動作)。
 * Hotbar 與詳情 Dialog 共用同一條路(同流程同元件);成功順手記 log。
 */
export const launchSkill = async (skill: Skill): Promise<void> => {
  try {
    await navigator.clipboard.writeText(skill.invocation)
    launchLog.value = [{ skillId: skill.id, at: new Date().toISOString() }, ...launchLog.value].slice(0, 200)
    toast.success(`已複製「${skill.name}」的調用 prompt,去 Claude 貼上即可`)
  } catch {
    toast.error('複製失敗,請手動選取複製')
  }
}

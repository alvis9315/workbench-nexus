import type { SkillCategory } from '@/types'

/** 分類設定(設定當資料管理:filter chips 與 Badge 都從這裡迭代)。 */
export const CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: 'frontend', label: '前端' },
  { value: 'backend', label: '後端' },
  { value: 'doc', label: 'SA・文件' },
  { value: 'pipeline', label: 'Pipeline' },
]

export const categoryLabel = (value: SkillCategory): string =>
  CATEGORIES.find((c) => c.value === value)?.label ?? value

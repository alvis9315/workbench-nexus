import { watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export const SHELL_THEMES = [
  {
    id: 'nexus-arcade',
    label: 'NEXUS ARCADE',
    description: '深宇宙藍＋街機金黃',
    colors: ['#060d1f', '#ffcf3f', '#24406e'],
  },
  {
    id: 'neon-protocol',
    label: 'NEON PROTOCOL',
    description: '科技白＋霓虹藍／粉',
    colors: ['#f5fbfe', '#00a8d4', '#ef4fae'],
  },
] as const

export type ShellThemeId = typeof SHELL_THEMES[number]['id']
export const shellThemeId = useLocalStorage<ShellThemeId>('wn-shell-theme', 'nexus-arcade')

const applyShellTheme = (id: ShellThemeId) => {
  if (typeof document === 'undefined') return
  const valid = SHELL_THEMES.some((theme) => theme.id === id) ? id : 'nexus-arcade'
  document.documentElement.dataset.shellTheme = valid
}

watch(shellThemeId, applyShellTheme, { immediate: true })

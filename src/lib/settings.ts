'use client'

export const SETTINGS_STORAGE_KEY = 'settings'

export type ThemeSetting = 'light' | 'dark'

export interface UserSettings {
  showPortraits: boolean
  showOpTypeFirst: boolean
  critOps: string
  tacOps: string
}

export const DEFAULT_SETTINGS: UserSettings = {
  showPortraits: true,
  showOpTypeFirst: false,
  critOps: '2025',
  tacOps: '2025'
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function safelyParseSettings(raw: string | null): Partial<UserSettings> | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as Partial<UserSettings>
  } catch (error) {
    console.warn('Failed to parse saved settings. Falling back to defaults.', error)
    return null
  }
}

function readPersistedSettings(): Partial<UserSettings> | null {
  if (!isBrowser()) return null
  return safelyParseSettings(window.localStorage.getItem(SETTINGS_STORAGE_KEY))
}

function persistSettings(settings: UserSettings) {
  if (!isBrowser()) return
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export function getSettings(): UserSettings {
  const saved = readPersistedSettings() ?? {}
  return { ...DEFAULT_SETTINGS, ...saved }
}

export function getSetting<K extends keyof UserSettings>(key: K): UserSettings[K] {
  const settings = getSettings()
  return settings[key]
}

export function setSettings(
  update: Partial<UserSettings> | ((current: UserSettings) => UserSettings)
): UserSettings {
  const current = getSettings()
  const resolved =
    typeof update === 'function' ? update(current) : { ...current, ...update }
  const merged = { ...DEFAULT_SETTINGS, ...resolved }
  persistSettings(merged)
  return merged
}

export function setSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]): UserSettings {
  return setSettings(current => ({ ...current, [key]: value }))
}

export function resetSettings(): UserSettings {
  const freshDefaults = { ...DEFAULT_SETTINGS }
  persistSettings(freshDefaults)
  return freshDefaults
}

// src/lib/featureFlags.ts
export class FeatureFlags {
  static EnableHomebrew: boolean

  static load() {
    FeatureFlags.EnableHomebrew = parseBool(
      process.env.ENABLE_HOMEBREW ?? process.env.NEXT_PUBLIC_ENABLE_HOMEBREW
    )
  }
}

function parseBool(val: string | undefined): boolean {
  if (!val) return false
  const s = val.trim().toLowerCase()
  return s === '1' || s === 'true' || s === 'yes' || s === 'on'
}

// Run immediately on import
FeatureFlags.load()

export function getOpPortraitUrl(opId: string): string {
  return `/api/ops/${opId}/portrait`
}

export function getRosterPortraitUrl(rosterId: string): string {
  return `/api/rosters/${rosterId}/portrait`
}

export function toEpochMs(d?: Date | string | number | null) {
  if (!d) return undefined
  if (d instanceof Date) return d.getTime()
  if (typeof d === 'number') return d
  const t = Date.parse(d) // string
  return Number.isFinite(t) ? t : (new Date()).getTime()
}

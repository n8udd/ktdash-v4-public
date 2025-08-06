export function getOpPortraitUrl(opId: string): string {
  return `/api/ops/${opId}/portrait`
}

export function getRosterPortraitUrl(rosterId: string): string {
  return `/api/rosters/${rosterId}/portrait`
}

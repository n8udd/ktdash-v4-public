export function getOpPortraitUrl(opId: string): string {
  return `/api/ops/${opId}/portrait`
}

export function getRosterPortraitUrl(rosterId: string): string {
  console.log("Getting portrait Url for roster", rosterId)
  console.log(`  Returning /api/rosters/${rosterId}/portrait`)
  return `/api/rosters/${rosterId}/portrait`
}

import { getAuthSession } from '@/lib/auth'
import { generatePageMetadata } from '@/lib/utils/generateMetadata'
import { getOpPortraitUrl, getRosterPortraitUrl, toEpochMs } from '@/lib/utils/imageUrls'
import { RosterService } from '@/services'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import RosterPageClient from './RosterPageClient'

export async function generateMetadata({ params }: { params: Promise<{ rosterId: string }> }): Promise<Metadata> {
  const { rosterId } = await params
  const roster = await RosterService.getRoster(rosterId)

  if (!roster) {
    return {
      title: 'Roster Not Found',
    }
  }

  const images: string[] = [];
  if (roster.hasCustomPortrait) {
    images.push(getRosterPortraitUrl(roster.rosterId))
  }
  roster.ops?.filter(op => op.hasCustomPortrait).map(op => op.hasCustomPortrait && images.push(`${getOpPortraitUrl(op.opId)}?v=${toEpochMs(op.portraitUpdatedAt)}`));

  return generatePageMetadata({
    title: `${roster.rosterName} by ${roster.user?.userName}`,
    description: roster.description || `A ${roster.killteam?.killteamName} Roster for KillTeam`,
    images: 
      images.length > 0
      ? images.map((img) => ({url: img}))
      : [{
        url: `/img/killteams/${roster.killteam?.killteamId}.webp`,
      }],
    keywords: [roster.rosterName, roster.killteam?.killteamName ?? '', 'roster', 'roster builder', 'battle tracker'],
    pagePath: `/rosters/${roster.rosterId}`
  })
}

export default async function RosterPage({ params }: { params: Promise<{ rosterId: string }> }) {
  const { rosterId } = await params
  const roster = (await RosterService.getRoster(rosterId))

  if (!roster) notFound()

  const session = await getAuthSession()
  const isOwner = session?.user?.userId === roster.userId

  if (!isOwner) {
    RosterService.incrementRosterViewCount(rosterId)
  }

  return (
    <div className="mx-auto">
      <RosterPageClient initialRoster={roster.toPlain()} isOwner={isOwner} />
    </div>
  )
}

import { getAuthSession } from '@/lib/auth'
import { GAME } from '@/lib/config/game_config'
import { generatePageMetadata } from '@/lib/utils/generateMetadata'
import { getOpPortraitUrl, getRosterPortraitUrl } from '@/lib/utils/imageUrls'
import { RosterService } from '@/services'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import RosterPageClient from './RosterPageClient'

export async function generateMetadata({ params, searchParams }: { params: Promise<{ rosterId: string }>, searchParams: URLSearchParams }): Promise<Metadata> {
  const { rosterId } = await params
  const roster = await RosterService.getRoster(rosterId)

  if (!roster) {
    return {
      title: 'Roster Not Found',
    }
  }

  const tab = searchParams.get('tab')
  const isGallery = tab === 'gallery'

  const images: string[] = [];
  if (roster.hasCustomPortrait) {
    images.push(getRosterPortraitUrl(roster.rosterId))
  }
  roster.ops?.filter(op => op.hasCustomPortrait).map(op => op.hasCustomPortrait && images.push(`${getOpPortraitUrl(op.opId)}?v=${op.updatedAt}`));

  return generatePageMetadata({
    title: `${roster.rosterName} by ${roster.user?.userName}${isGallery ? ' - Gallery' : ''}`,
    description: roster.description ?? `A ${roster.killteam?.killteamName} Roster for ${GAME.NAME}`,
    images: 
      images.length > 0
      ? images.map((img) => ({url: img}))
      : [{
        url: `/img/killteams/${roster.killteam?.killteamId}.jpg`,
      }],
    keywords: [roster.rosterName, roster.killteam?.killteamName ?? '', isGallery ? 'gallery' : '', 'roster', 'roster builder', 'battle tracker'],
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

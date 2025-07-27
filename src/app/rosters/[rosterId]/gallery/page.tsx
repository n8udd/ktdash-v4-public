import { KillteamLink, UserLink } from '@/components/shared/Links'
import { GAME } from '@/lib/config/game_config'
import { generatePageMetadata } from '@/lib/utils/generateMetadata'
import { RosterService } from '@/services'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ rosterId: string }> }): Promise<Metadata> {
  const { rosterId } = await params
  const roster = await RosterService.getRoster(rosterId)

  if (!roster) {
    return {
      title: 'Roster Not Found',
    }
  }

  return generatePageMetadata({
    title: `${roster.rosterName} by ${roster.user?.userName} - Gallery`,
    description: `A ${roster.killteam?.killteamName} Roster for ${GAME.NAME}`,
    image: {
      url: roster.hasCustomPortrait ? `/uploads/user_${roster?.userId}/roster_${roster.rosterId}/roster_${roster.rosterId}.jpg?v=${roster.updatedAt}` : `/img/killteams/${roster.killteam?.killteamId}.jpg`,
    },
    keywords: [roster.rosterName, roster.killteam?.killteamName ?? '', 'roster', 'roster builder', 'battle tracker'],
    pagePath: `/rosters/${roster.rosterId}/gallery`
  })
}

export default async function RosterPage({ params }: { params: Promise<{ rosterId: string }> }) {
  const { rosterId } = await params
  const roster = (await RosterService.getRoster(rosterId))

  if (!roster) notFound()

  return (
    <div className="flex flex-col justify-center items-center gap-2 px-1 py-8 max-w-7xl mx-auto">
      <Link href={`/rosters/${roster.rosterId}`}>
        <h3 className="text-center font-title">
          {roster.rosterName}
        </h3>
      </Link>
      <div>
        <KillteamLink
          killteamId={roster.killteamId}
          killteamName={roster.killteam?.killteamName || 'Unknown Killteam'}
        />
        <span> by </span>
        <UserLink userName={roster.user?.userName || 'Unknown User'} />
      </div>
      
      {/* Roster portrait */}
      {roster.hasCustomPortrait && (
        <div className="mb-10 text-center flex flex-col items-center space-y-4">
          <Image
            src={`/uploads/user_${roster?.userId}/roster_${roster.rosterId}/roster_${roster.rosterId}.jpg?v=${roster.updatedAt}`}
            alt={`${roster.rosterName} Portrait`}
            width={600}
            height={600}
            className="mx-auto max-h-[600px] object-contain"
          />
        </div>
      )}

      {/* Op Portraits */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {roster.ops?.filter((op) => op.hasCustomPortrait).map((op, idx) => (
          <div key={idx} className="text-center">
            <h4 className="text-center bg-black font-title text-main">
              {op.opName}
            </h4>
            <Image
              src={`/uploads/user_${roster?.userId}/roster_${op.rosterId}/op_${op.opId}.jpg?v=${op.updatedAt}`}
              alt={op.opName}
              width={600}
              height={600}
              className="mx-auto max-h-[400px] object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

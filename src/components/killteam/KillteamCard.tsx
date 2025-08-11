import { KillteamPlain } from '@/types'
import Link from 'next/link'
import { UserLink } from '../shared/Links'
import Markdown from '../ui/Markdown'

type KillteamCardProps = {
  killteam: KillteamPlain
}

export default function KillteamCard({ killteam }: KillteamCardProps) {
  return (
    <div className="group grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] bg-card border border-border rounded overflow-hidden hover:border-main transition h-[120px]">
      {/* Image section - left side */}
      <Link href={`/killteams/${killteam.killteamId}`} className="relative">
        <div 
          className="absolute inset-0 border-r border-border bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
          style={{ backgroundImage: `url(/img/killteams/${killteam.killteamId}.webp)` }}
        />
      </Link>

      {/* Content section - right side */}
      <div className="relative px-2 py-1 flex flex-col justify-between">
        <Link href={`/killteams/${killteam.killteamId}`}>
          <div className="flex items-center gap-x-1">
            <h6 className="font-heading text-main">{killteam.killteamName}</h6>
          </div>
        </Link>
        {killteam.isHomebrew && (
          <div className="min-w-0 text-sm text-muted">
            Homebrew
            {killteam.user && (
              <> by <UserLink userName={killteam.user.userName ?? 'Unknown'} /></>
            )}
          </div>
        )}
        <Markdown className={killteam.isHomebrew ? 'line-clamp-2' : 'line-clamp-3'}>
          {killteam.description}
        </Markdown>
      </div>
    </div>
  )
}

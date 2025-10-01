'use client'

import { KillteamPlain } from '@/types'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FiEdit } from 'react-icons/fi'
import { UserLink } from '../shared/Links'
import Markdown from '../ui/Markdown'

type KillteamCardProps = {
  killteam: KillteamPlain
}

export default function KillteamCard({ killteam }: KillteamCardProps) {
  const { data: session } = useSession()
  const canEdit = !!session?.user?.userId && !!killteam.userId && session.user.userId === killteam.userId

  return (
    <div className="group grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] bg-card border border-border rounded hover:border-main transition h-[120px]">
      {/* Image section - left side */}
      <Link href={`/killteams/${killteam.killteamId}`} className="relative overflow-hidden">
        <div 
          className="absolute inset-0 border-r border-border bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
          style={{
            backgroundImage: killteam.isHomebrew && killteam.userId
              ? `url(/api/killteams/${killteam.killteamId}/portrait?thumb=1)`
              : `url(/img/killteams/${killteam.killteamId}_thumb.webp)`
          }}
        />
      </Link>

      {/* Content section - right side */}
      <div className="relative px-3 py-2 flex flex-col justify-between h-full min-w-0">
        <div className="flex items-center gap-x-1">
          <Link href={`/killteams/${killteam.killteamId}`} className="block overflow-hidden">
            <h6 className="font-heading text-main truncate leading-snug whitespace-nowrap">{killteam.killteamName}</h6>
          </Link>
          {canEdit && (
            <Link
              href={`/killteams/${killteam.killteamId}/edit`}
              className="ml-auto p-1 text-muted hover:text-main"
              title="Edit"
            >
              <FiEdit className="w-4 h-4" />
            </Link>
          )}
        </div>
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

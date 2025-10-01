import PageTitle from '@/components/ui/PageTitle'
import { generatePageMetadata } from '@/lib/utils/generateMetadata'
import { KillteamService } from '@/services'
import KillteamsPageClient from './KillteamsPageClient'

export async function generateMetadata() {
  const killteams = await KillteamService.getAllKillteams()

  if (!killteams || killteams.length === 0) return {}

  const images = killteams
    .slice(0, 5)
    .map((kt) => ({
      url: kt.isHomebrew && kt.userId
        ? `/api/killteams/${kt.killteamId}/portrait`
        : `/img/killteams/${kt.killteamId}.webp`,
      alt: `${kt.killteamName}`,
    }))

  return generatePageMetadata({
    title: 'Killteams',
    description: `Browse all killteams, operatives, ploys, equipment, tacops, and painted minis.`,
    images,
    keywords: ['home', 'roster builder', 'battle tracker', 'killteam', 'killteams', 'operatives', 'datacards'],
    pagePath: `/killteams`
  })
}

export default async function KillteamsPage() {
  const killteams = await KillteamService.getAllKillteams()

  return (
    <div className="px-1 py-8 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <PageTitle>Killteams</PageTitle>
      </div>
      <KillteamsPageClient
        killteams={killteams.map((killteam) => killteam.toPlain())}
      />
    </div>
  )
}

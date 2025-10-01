import PageTitle from '@/components/ui/PageTitle'
import { GAME } from '@/lib/config/game_config'
import { KillteamService } from '@/services'
import KillteamsPageClient from './KillteamsPageClient'

export const metadata = {
  title: `Killteams - ${GAME.NAME}`,
  description: `Browse all killteams, operatives, ploys, equipment, and tacops.`,
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

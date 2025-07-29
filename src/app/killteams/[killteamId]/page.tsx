import Markdown from '@/components/ui/Markdown'
import PageTitle from '@/components/ui/PageTitle'
import { generatePageMetadata } from '@/lib/utils/generateMetadata'
import { WeaponRuleService } from '@/services/weaponRule.service'
import { KillteamService } from '@/src/services'
import { notFound } from 'next/navigation'
import KillteamPageClient from './KillteamPageClient'

export async function generateMetadata({ params }: { params: Promise<{ killteamId: string }>  }) {
  const { killteamId } = await params
  const killteam = await KillteamService.getKillteam(killteamId)
  
  if (!killteam) return {}

  return generatePageMetadata({
    title: `${killteam.killteamName}`,
    description: `${killteam.description}`,
    image: {
      url: `/img/killteams/${killteamId}.jpg`,
    },
    keywords: ['home', 'roster builder', 'battle tracker', 'killteam', killteam.killteamId, killteam.killteamName],
    pagePath: `/killteams/${killteam.killteamId}`
  })
}

export default async function KillteamPage({ params }: { params: Promise<{ killteamId: string }> }) {
  const { killteamId } = await params
  const killteam = await KillteamService.getKillteam(killteamId)

  if (!killteam) notFound()
    
  const allWeaponRules = await WeaponRuleService.getAllWeaponRules()

  return (
    <div className="max-w-full">
      <div className="relative min-h-[300px] md:h-[400px] flex items-center justify-center py-12">
        <div 
          className="absolute inset-0 bg-cover bg-top"
          style={{ backgroundImage: `url(/img/killteams/${killteam.killteamId}.jpg)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
        </div>
        <div className="relative flex flex-col items-center justify-center px-8 pt-48 w-full">
          <div className="flex items-center gap-x-4 mb-4 text-left">
            <PageTitle>{killteam.killteamName}</PageTitle>
          </div>
          <div className="text-white max-w-2xl text-left">
            <Markdown>{killteam.description}</Markdown>
          </div>
        </div>
      </div>
      <div className="px-1 py-8 max-w-7xl mx-auto">
        <KillteamPageClient killteam={killteam.toPlain()} />
      </div>
    </div>
  )
}
  
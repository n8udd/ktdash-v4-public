import { generatePageMetadata } from '@/lib/utils/generateMetadata'
import { WeaponRuleService } from '@/services/weaponRule.service'
import { KillteamService } from '@/src/services'
import { notFound } from 'next/navigation'
import KillteamEditorClient from './KillteamEditorClient'

export async function generateMetadata({ params }: { params: Promise<{ killteamId: string }>  }) {
  const { killteamId } = await params
  const killteam = await KillteamService.getKillteam(killteamId)
  
  if (!killteam) return {}

  const description =
    (killteam.isHomebrew ? `Homebrew by ${killteam.user?.userName ?? 'Unknown'} - ` : '')
    + killteam.description

  return generatePageMetadata({
    title: `${killteam.killteamName} - Edit`,
    description: `${description}`,
    images: [{
      url: killteam.isHomebrew ? `/api/killteams/${killteamId}/portrait` : `/img/killteams/${killteamId}.webp`,
    }],
    keywords: ['home', 'roster builder', 'battle tracker', 'killteam', killteam.killteamId, killteam.killteamName],
    pagePath: `/killteams/${killteam.killteamId}`
  })
}

export default async function KillteamEditorPage({ params }: { params: Promise<{ killteamId: string }> }) {
  const { killteamId } = await params
  const killteam = await KillteamService.getKillteam(killteamId)

  if (!killteam) notFound()
    
  const allWeaponRules = await WeaponRuleService.getAllWeaponRules()

  return (
    <div className="px-1 py-8 max-w-7xl mx-auto">
      <KillteamEditorClient killteam={killteam.toPlain()} />
    </div>
  )
}
  

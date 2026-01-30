// @ts-nocheck
import { KillteamRepository, KillteamScope } from '@/src/repositories/killteam.repository'
import { Killteam } from '@/types'
import { KillteamVoteService } from './killteamVote.service'

type KillteamQueryOptions = {
  userId?: string
}

export class KillteamService {
  private static repository = new KillteamRepository()

  static async getKillteamRow(killteamId: string): Promise<Killteam | null> {
    const killteam = await this.repository.getKillteamRow(killteamId)
    return killteam ? new Killteam(killteam) : null
  }

  private static async attachVoteData(rows: any[], options?: KillteamQueryOptions): Promise<Killteam[]> {
    if (!rows?.length) return []

    const homebrewIds = rows.filter(row => row?.factionId === 'HBR').map(row => row.killteamId)
    const [summaries, userVotes] = homebrewIds.length
      ? await Promise.all([
          KillteamVoteService.getSummaries(homebrewIds),
          options?.userId ? KillteamVoteService.getUserVotes(homebrewIds, options.userId) : {},
        ])
      : [{}, {}]

    return rows.map(row => {
      const base = {
        ...row,
        rosterCount: row._count?.rosters ?? row.rosterCount ?? 0,
      }

      if (row.factionId === 'HBR') {
        base.voteSummary = summaries[row.killteamId] ?? { upvotes: 0, downvotes: 0, total: 0, ratio: 0 }
        if (options?.userId) {
          base.userVote = userVotes[row.killteamId] ?? null
        }
      }

      return new Killteam(base)
    })
  }

  static async getKillteam(killteamId: string, options?: KillteamQueryOptions): Promise<Killteam | null> {
    const killteam = await this.repository.getKillteam(killteamId)
    if (!killteam) return null
    const [hydrated] = await this.attachVoteData([killteam], options)
    return hydrated ?? null
  }

  static async getAllKillteams(scope: KillteamScope = 'all', options?: KillteamQueryOptions): Promise<Killteam[]> {
    const killteams = await this.repository.getAllKillteams(scope)
    return this.attachVoteData(killteams, options)
  }

  static async getAllKillteamsFull(scope: KillteamScope = 'all', options?: KillteamQueryOptions): Promise<Killteam[]> {
    // Get the list of published killteams, then load each fully
    const basicList = await this.repository.getAllKillteams(scope)
    const fullList = await Promise.all(
      basicList.map(({ killteamId }: { killteamId: string }) => this.getKillteam(killteamId, options))
    )
    return fullList.filter(Boolean) as Killteam[]
  }

  static async createKillteam(data: any): Promise<Killteam | null> {
    const row = await this.repository.createKillteam(data)
    return row ? await this.getKillteam(row.killteamId) : null
  }

  static async updateKillteam(killteamId: string, data: any): Promise<Killteam | null> {
    const row = await this.repository.updateKillteam(killteamId, data)
    return row ? await this.getKillteam(killteamId) : null
  }

  static async deleteKillteam(killteamId: string): Promise<void> {
    await this.repository.deleteKillteam(killteamId)
  }
}

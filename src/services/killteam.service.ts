// @ts-nocheck
import { KillteamRepository, KillteamScope } from '@/src/repositories/killteam.repository'
import { Killteam } from '@/types'

export class KillteamService {
  private static repository = new KillteamRepository()

  static async getKillteamRow(killteamId: string): Promise<Killteam | null> {
    const killteam = await this.repository.getKillteamRow(killteamId)
    return killteam ? new Killteam(killteam) : null
  }

  static async getKillteam(killteamId: string): Promise<Killteam | null> {
    const killteam = await this.repository.getKillteam(killteamId)
    return killteam ? new Killteam(killteam) : null
  }

  static async getAllKillteams(scope: KillteamScope = 'all'): Promise<Killteam[]> {
    const killteams = await this.repository.getAllKillteams(scope)
    return killteams.map(killteam => new Killteam({
      ...killteam,
      rosterCount: killteam._count?.rosters ?? 0,
    }))
  }

  static async getAllKillteamsFull(): Promise<Killteam[]> {
    // Get the list of published killteams, then load each fully
    const basicList = await this.repository.getAllKillteams()
    const fullList = await Promise.all(
      basicList.map(({ killteamId }) => this.getKillteam(killteamId))
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

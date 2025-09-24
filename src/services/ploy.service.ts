// @ts-nocheck
import { PloyRepository } from '@/src/repositories/ploy.repository'
import { Ploy } from '@/types'

export class PloyService {
  private static repository = new PloyRepository()

  static async getPloyRow(ployId: string): Promise<Ploy | null> {
    const row = await this.repository.getPloyRow(ployId)
    return row ? new Ploy(row as any) : null
  }

  static async getPloy(ployId: string): Promise<Ploy | null> {
    const row = await this.repository.getPloy(ployId)
    return row ? new Ploy(row as any) : null
  }

  static async createPloy(data: any): Promise<Ploy | null> {
    const row = await this.repository.createPloy(data)
    return row ? new Ploy(row as any) : null
  }

  static async updatePloy(ployId: string, data: any): Promise<Ploy | null> {
    const row = await this.repository.updatePloy(ployId, data)
    return row ? new Ploy(row as any) : null
  }

  static async deletePloy(ployId: string): Promise<void> {
    await this.repository.deletePloy(ployId)
  }

  static async countForKillteam(killteamId: string): Promise<number> {
    return this.repository.countForKillteam(killteamId)
  }

  static async fixPloySeqs(killteamId: string, ployType: 'S' | 'F'): Promise<void> {
    await this.repository.fixPloySeqs(killteamId, ployType)
  }
}

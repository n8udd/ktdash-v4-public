// @ts-nocheck
import { EquipmentRepository } from '@/src/repositories/equipment.repository'
import { Equipment } from '@/types'

export class EquipmentService {
  private static repository = new EquipmentRepository()

  static async getEquipmentRow(eqId: string): Promise<Equipment | null> {
    const row = await this.repository.getEquipmentRow(eqId)
    return row ? new Equipment(row as any) : null
  }

  static async getEquipment(eqId: string): Promise<Equipment | null> {
    const row = await this.repository.getEquipment(eqId)
    return row ? new Equipment(row as any) : null
  }

  static async createEquipment(data: any): Promise<Equipment | null> {
    const row = await this.repository.createEquipment(data)
    return row ? new Equipment(row as any) : null
  }

  static async updateEquipment(eqId: string, data: any): Promise<Equipment | null> {
    const row = await this.repository.updateEquipment(eqId, data)
    return row ? new Equipment(row as any) : null
  }

  static async deleteEquipment(eqId: string): Promise<void> {
    await this.repository.deleteEquipment(eqId)
  }

  static async countForKillteam(killteamId: string): Promise<number> {
    return this.repository.countForKillteam(killteamId)
  }

  static async fixEquipmentSeqs(killteamId: string): Promise<void> {
    await this.repository.fixEquipmentSeqs(killteamId)
  }
}

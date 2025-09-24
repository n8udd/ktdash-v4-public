import { OpTypeRepository } from '@/src/repositories/opType.repository'
import { OpType } from '@/types'

export class OpTypeService {
  private static repository = new OpTypeRepository()

  static async getOpTypeRow(opTypeId: string): Promise<OpType | null> {
    const opType = await this.repository.getOpTypeRow(opTypeId)
    return opType ? new OpType(opType) : null
  }

  static async getOpType(opTypeId: string): Promise<OpType | null> {
    const opType = await this.repository.getOpType(opTypeId)
    return opType ? new OpType(opType) : null
  }

  static async createOpType(data: any): Promise<OpType | null> {
    const row = await this.repository.createOpType(data)
    return row ? new OpType(row) : null
  }

  static async updateOpType(opTypeId: string, data: any): Promise<OpType | null> {
    const row = await this.repository.updateOpType(opTypeId, data)
    return row ? new OpType(row) : null
  }

  static async deleteOpType(opTypeId: string): Promise<void> {
    await this.repository.deleteOpType(opTypeId)
  }

  static async countForKillteam(killteamId: string): Promise<number> {
    return this.repository.countForKillteam(killteamId)
  }

  static async fixOpTypeSeqs(killteamId: string): Promise<void> {
    await this.repository.fixOpTypeSeqs(killteamId)
  }
}

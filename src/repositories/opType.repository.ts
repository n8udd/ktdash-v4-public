import type { OpType } from '@prisma/client'
import { BaseRepository } from './base.repository'

export class OpTypeRepository extends BaseRepository {
  async getOpTypeRow(opTypeId: string): Promise<OpType | null> {
    return this.prisma.opType.findUnique({
      where: { opTypeId }
    })
  }

  async getOpType(opTypeId: string) {
    return this.prisma.opType.findUnique({
      where: { opTypeId },
      //include: {
      //  weapons: {
      //    orderBy: [
      //      { seq: 'asc' },
      //      { wepName: 'asc' }
      //    ],
      //    include: {
      //      profiles: {
      //        orderBy: { seq: 'asc' }
      //      }
      //    }
      //  }
      //}
    })
  }

  async getNextSeqForKillteam(killteamId: string): Promise<number> {
    const last = await this.prisma.opType.findFirst({
      where: { killteamId },
      orderBy: { seq: 'desc' }
    })
    return (last?.seq ?? 0) + 1
  }

  async createOpType(data: any) {
    const seq = await this.getNextSeqForKillteam(data.killteamId)
    return this.prisma.opType.create({
      data: {
        opTypeId: data.opTypeId,
        killteamId: data.killteamId,
        seq,
        opTypeName: data.opTypeName,
        MOVE: data.MOVE,
        APL: data.APL,
        SAVE: data.SAVE,
        WOUNDS: data.WOUNDS,
        keywords: data.keywords ?? '',
        basesize: data.basesize ?? 32,
        nameType: data.nameType ?? ''
      }
    })
  }

  async updateOpType(opTypeId: string, data: any) {
    return this.prisma.opType.update({
      where: { opTypeId },
      data: {
        seq: data.seq,
        opTypeName: data.opTypeName,
        MOVE: data.MOVE,
        APL: data.APL,
        SAVE: data.SAVE,
        WOUNDS: data.WOUNDS,
        keywords: data.keywords,
        basesize: data.basesize,
        nameType: data.nameType,
      }
    })
  }

  async deleteOpType(opTypeId: string) {
    return this.prisma.opType.delete({ where: { opTypeId } })
  }

  async countForKillteam(killteamId: string): Promise<number> {
    return this.prisma.opType.count({ where: { killteamId } })
  }

  async fixOpTypeSeqs(killteamId: string) {
    const ops = await this.prisma.opType.findMany({
      where: { killteamId },
      orderBy: [{ seq: 'asc' }]
    })

    await Promise.all(
      ops.map((op, index) =>
        this.prisma.opType.update({
          where: { opTypeId: op.opTypeId },
          data: { seq: index + 1 }
        })
      )
    )
  }
}

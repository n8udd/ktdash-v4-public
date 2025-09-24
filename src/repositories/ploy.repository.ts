import { BaseRepository } from './base.repository'

export class PloyRepository extends BaseRepository {
  async getPloyRow(ployId: string) {
    return this.prisma.ploy.findUnique({ where: { ployId } })
  }

  async getPloy(ployId: string) {
    return this.prisma.ploy.findUnique({ where: { ployId } })
  }

  async getNextSeqForKillteam(killteamId: string): Promise<number> {
    const last = await this.prisma.ploy.findFirst({
      where: { killteamId },
      orderBy: { seq: 'desc' }
    })
    return (last?.seq ?? 0) + 1
  }

  async countForKillteam(killteamId: string): Promise<number> {
    return this.prisma.ploy.count({ where: { killteamId } })
  }

  async createPloy(data: { ployId: string, killteamId: string, ployType: string, ployName: string, description: string, effects?: string }) {
    const seq = await this.getNextSeqForKillteam(data.killteamId)
    return this.prisma.ploy.create({
      data: {
        ployId: data.ployId,
        killteamId: data.killteamId,
        seq,
        ployType: data.ployType,
        ployName: data.ployName,
        description: data.description ?? '',
        effects: data.effects ?? ''
      }
    })
  }

  async updatePloy(ployId: string, data: any) {
    return this.prisma.ploy.update({
      where: { ployId },
      data: {
        seq: data.seq,
        ployType: data.ployType,
        ployName: data.ployName,
        description: data.description,
        effects: data.effects,
      }
    })
  }

  async deletePloy(ployId: string) {
    return this.prisma.ploy.delete({ where: { ployId } })
  }

  async fixPloySeqs(killteamId: string, ployType: 'S' | 'F') {
    const list = await this.prisma.ploy.findMany({
      where: { killteamId, ployType },
      orderBy: [{ seq: 'asc' }]
    })
    await Promise.all(
      list.map((p, idx) =>
        this.prisma.ploy.update({ where: { ployId: p.ployId }, data: { seq: idx + 1 } })
      )
    )
  }
}

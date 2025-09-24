import { BaseRepository } from './base.repository'

export class EquipmentRepository extends BaseRepository {
  async getEquipmentRow(eqId: string) {
    return this.prisma.equipment.findUnique({ where: { eqId } })
  }

  async getEquipment(eqId: string) {
    return this.prisma.equipment.findUnique({ where: { eqId } })
  }

  async getNextSeqForKillteam(killteamId: string): Promise<number> {
    const last = await this.prisma.equipment.findFirst({
      where: { killteamId },
      orderBy: { seq: 'asc' }
    })
    return (last?.seq ?? 0) + 1
  }

  async countForKillteam(killteamId: string): Promise<number> {
    return this.prisma.equipment.count({ where: { killteamId } })
  }

  async createEquipment(data: { eqId: string, killteamId: string, eqName: string, description: string, effects: string }) {
    const seq = await this.getNextSeqForKillteam(data.killteamId)
    return this.prisma.equipment.create({
      data: {
        eqId: data.eqId,
        killteamId: data.killteamId,
        seq,
        eqName: data.eqName,
        description: data.description ?? '',
        effects: data.effects ?? ''
      }
    })
  }

  async updateEquipment(eqId: string, data: any) {
    return this.prisma.equipment.update({
      where: { eqId },
      data: {
        seq: data.seq,
        eqName: data.eqName,
        description: data.description,
        effects: data.effects,
      }
    })
  }

  async deleteEquipment(eqId: string) {
    return this.prisma.equipment.delete({ where: { eqId } })
  }

  async fixEquipmentSeqs(killteamId: string) {
    const list = await this.prisma.equipment.findMany({
      where: { killteamId },
      orderBy: [{ seq: 'asc' }]
    })
    await Promise.all(
      list.map((e, idx) =>
        this.prisma.equipment.update({ where: { eqId: e.eqId }, data: { seq: idx + 1 } })
      )
    )
  }
}

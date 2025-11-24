import { BaseRepository } from './base.repository'

export class OptionRepository extends BaseRepository {
  async getOptionRow(optionId: string) {
    return this.prisma.option.findUnique({ where: { optionId } })
  }

  async getOption(optionId: string) {
    return this.prisma.option.findUnique({ where: { optionId } })
  }

  async getOpType(opTypeId: string) {
    return this.prisma.opType.findUnique({ where: { opTypeId } })
  }

  async getNextSeqForOpType(opTypeId: string): Promise<number> {
    const last = await this.prisma.option.findFirst({
      where: { opTypeId },
      orderBy: { seq: 'desc' }
    })
    return (last?.seq ?? 0) + 1
  }

  async countForOpType(opTypeId: string): Promise<number> {
    return this.prisma.option.count({ where: { opTypeId } })
  }

  async createOption(data: { optionId: string, opTypeId: string, optionName: string, description: string, effects: string }) {
    const seq = await this.getNextSeqForOpType(data.opTypeId)
    return this.prisma.option.create({
      data: {
        optionId: data.optionId,
        opTypeId: data.opTypeId,
        seq,
        optionName: data.optionName,
        description: data.description ?? '',
        effects: data.effects ?? '',
      }
    })
  }

  async updateOption(optionId: string, data: any) {
    return this.prisma.option.update({
      where: { optionId },
      data: {
        seq: data.seq,
        optionName: data.optionName,
        description: data.description,
        effects: data.effects,
      }
    })
  }

  async deleteOption(optionId: string) {
    return this.prisma.option.delete({ where: { optionId } })
  }

  async fixOptionSeqs(opTypeId: string) {
    const list = await this.prisma.option.findMany({
      where: { opTypeId },
      orderBy: [{ seq: 'asc' }]
    })
    await Promise.all(
      list.map((opt, idx) =>
        this.prisma.option.update({ where: { optionId: opt.optionId }, data: { seq: idx + 1 } })
      )
    )
  }
}

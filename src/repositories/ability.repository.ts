import { BaseRepository } from './base.repository'

export class AbilityRepository extends BaseRepository {
  async getAbilityRow(abilityId: string) {
    return this.prisma.ability.findUnique({ where: { abilityId } })
  }

  async getAbility(abilityId: string) {
    return this.prisma.ability.findUnique({ where: { abilityId } })
  }

  async getOpType(opTypeId: string) {
    return this.prisma.opType.findUnique({ where: { opTypeId } })
  }

  async countForOpType(opTypeId: string): Promise<number> {
    return this.prisma.ability.count({ where: { opTypeId } })
  }

  async createAbility(data: { abilityId: string, opTypeId: string, abilityName: string, description: string, AP?: number | null }) {
    return this.prisma.ability.create({
      data: {
        abilityId: data.abilityId,
        opTypeId: data.opTypeId,
        abilityName: data.abilityName,
        description: data.description ?? '',
        AP: data.AP ?? null,
      }
    })
  }

  async updateAbility(abilityId: string, data: any) {
    return this.prisma.ability.update({
      where: { abilityId },
      data: {
        abilityName: data.abilityName,
        description: data.description,
        AP: data.AP,
      }
    })
  }

  async deleteAbility(abilityId: string) {
    return this.prisma.ability.delete({ where: { abilityId } })
  }
}


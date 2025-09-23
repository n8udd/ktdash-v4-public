// @ts-nocheck
import { AbilityRepository } from '@/src/repositories/ability.repository'
import { Ability } from '@/types'

export class AbilityService {
  private static repository = new AbilityRepository()

  static async getAbilityRow(abilityId: string): Promise<Ability | null> {
    const row = await this.repository.getAbilityRow(abilityId)
    return row ? new Ability(row as any) : null
  }

  static async getAbility(abilityId: string): Promise<Ability | null> {
    const row = await this.repository.getAbility(abilityId)
    return row ? new Ability(row as any) : null
  }

  static async getOpType(opTypeId: string) {
    return this.repository.getOpType(opTypeId)
  }

  static async createAbility(data: any): Promise<Ability | null> {
    const row = await this.repository.createAbility(data)
    return row ? new Ability(row as any) : null
  }

  static async updateAbility(abilityId: string, data: any): Promise<Ability | null> {
    const row = await this.repository.updateAbility(abilityId, data)
    return row ? new Ability(row as any) : null
  }

  static async deleteAbility(abilityId: string): Promise<void> {
    await this.repository.deleteAbility(abilityId)
  }

  static async countForOpType(opTypeId: string): Promise<number> {
    return this.repository.countForOpType(opTypeId)
  }
}


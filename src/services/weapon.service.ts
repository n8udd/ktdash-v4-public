// @ts-nocheck
import { WeaponRepository } from '@/src/repositories/weapon.repository'
import { Weapon } from '@/types'

export class WeaponService {
  private static repository = new WeaponRepository()

  static async getWeaponRow(wepId: string): Promise<Weapon | null> {
    const row = await this.repository.getWeaponRow(wepId)
    return row ? new Weapon(row as any) : null
  }

  static async getWeapon(wepId: string): Promise<Weapon | null> {
    const row = await this.repository.getWeapon(wepId)
    return row ? new Weapon(row as any) : null
  }

  static async createWeaponWithDefaultProfile(data: any): Promise<Weapon | null> {
    const row = await this.repository.createWeaponWithDefaultProfile(data)
    return row ? new Weapon(row as any) : null
  }

  static async updateWeapon(wepId: string, data: any): Promise<Weapon | null> {
    const row = await this.repository.updateWeapon(wepId, data)
    return row ? new Weapon(row as any) : null
  }

  static async deleteWeapon(wepId: string): Promise<void> {
    await this.repository.deleteWeapon(wepId)
  }

  static async countForOpType(opTypeId: string): Promise<number> {
    return this.repository.countForOpType(opTypeId)
  }
}

// @ts-nocheck
import { WeaponProfileRepository } from '@/src/repositories/weaponProfile.repository'
import { WeaponProfile } from '@/types'

export class WeaponProfileService {
  private static repository = new WeaponProfileRepository()

  static async getProfileRow(wepprofileId: string): Promise<WeaponProfile | null> {
    const row = await this.repository.getProfileRow(wepprofileId)
    return row ? new WeaponProfile(row as any) : null
  }

  static async getProfile(wepprofileId: string): Promise<WeaponProfile | null> {
    const row = await this.repository.getProfile(wepprofileId)
    return row ? new WeaponProfile(row as any) : null
  }

  static async createProfile(data: any): Promise<WeaponProfile | null> {
    const row = await this.repository.createProfile(data)
    return row ? new WeaponProfile(row as any) : null
  }

  static async updateProfile(wepprofileId: string, data: any): Promise<WeaponProfile | null> {
    const row = await this.repository.updateProfile(wepprofileId, data)
    return row ? new WeaponProfile(row as any) : null
  }

  static async deleteProfile(wepprofileId: string): Promise<void> {
    await this.repository.deleteProfile(wepprofileId)
  }

  // Helpers for validation
  static async getWeapon(wepId: string) { return this.repository.getWeapon(wepId) }
  static async getOpType(opTypeId: string) { return this.repository.getOpType(opTypeId) }
  static async getKillteam(killteamId: string) { return this.repository.getKillteam(killteamId) }
  static async countForWeapon(wepId: string) { return this.repository.countForWeapon(wepId) }
}


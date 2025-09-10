import { BaseRepository } from './base.repository'

export class WeaponRepository extends BaseRepository {
  async getWeaponRow(wepId: string) {
    return this.prisma.weapon.findUnique({ where: { wepId } })
  }

  async getWeapon(wepId: string) {
    return this.prisma.weapon.findUnique({
      where: { wepId },
      include: {
        profiles: { orderBy: { seq: 'asc' } }
      }
    })
  }

  async getOpType(opTypeId: string) {
    return this.prisma.opType.findUnique({ where: { opTypeId } })
  }

  async getKillteam(killteamId: string) {
    return this.prisma.killteam.findUnique({ where: { killteamId } })
  }

  async getNextSeqForOpType(opTypeId: string): Promise<number> {
    const last = await this.prisma.weapon.findFirst({
      where: { opTypeId },
      orderBy: { seq: 'desc' }
    })
    return (last?.seq ?? 0) + 1
  }

  async countForOpType(opTypeId: string): Promise<number> {
    return this.prisma.weapon.count({ where: { opTypeId } })
  }

  async createWeaponWithDefaultProfile(data: { wepId: string, opTypeId: string, wepName: string, wepType: string, isDefault: boolean }) {
    const seq = await this.getNextSeqForOpType(data.opTypeId)
    const wep = await this.prisma.weapon.create({
      data: {
        wepId: data.wepId,
        opTypeId: data.opTypeId,
        seq,
        wepName: data.wepName,
        wepType: data.wepType,
        isDefault: data.isDefault,
      }
    })
    // Create default profile
    await this.prisma.weaponProfile.create({
      data: {
        wepprofileId: `${wep.wepId}-0`,
        wepId: wep.wepId,
        seq: 1,
        profileName: 'Default',
        ATK: '4',
        HIT: '4+',
        DMG: '3/4',
        WR: '',
      }
    })
    // Return with profiles populated
    return this.getWeapon(wep.wepId)
  }

  async updateWeapon(wepId: string, data: any) {
    return this.prisma.weapon.update({
      where: { wepId },
      data: {
        wepName: data.wepName,
        wepType: data.wepType,
        isDefault: data.isDefault,
      }
    })
  }

  async deleteWeapon(wepId: string) {
    // delete profiles first to avoid FK restriction
    await this.prisma.weaponProfile.deleteMany({ where: { wepId } })
    return this.prisma.weapon.delete({ where: { wepId } })
  }
}

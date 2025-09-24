import { BaseRepository } from './base.repository'

export class WeaponProfileRepository extends BaseRepository {
  async getProfileRow(wepprofileId: string) {
    return this.prisma.weaponProfile.findUnique({ where: { wepprofileId } })
  }

  async getProfile(wepprofileId: string) {
    return this.prisma.weaponProfile.findUnique({ where: { wepprofileId } })
  }

  async getWeapon(wepId: string) {
    return this.prisma.weapon.findUnique({ where: { wepId } })
  }

  async getOpType(opTypeId: string) {
    return this.prisma.opType.findUnique({ where: { opTypeId } })
  }

  async getKillteam(killteamId: string) {
    return this.prisma.killteam.findUnique({ where: { killteamId } })
  }

  async countForWeapon(wepId: string): Promise<number> {
    return this.prisma.weaponProfile.count({ where: { wepId } })
  }

  async getNextSeqForWeapon(wepId: string): Promise<number> {
    const last = await this.prisma.weaponProfile.findFirst({
      where: { wepId },
      orderBy: { seq: 'desc' }
    })
    return (last?.seq ?? 0) + 1
  }

  async createProfile(data: { wepprofileId: string, wepId: string, profileName: string, ATK: string, HIT: string, DMG: string, WR: string }) {
    const seq = await this.getNextSeqForWeapon(data.wepId)
    return this.prisma.weaponProfile.create({
      data: {
        wepprofileId: data.wepprofileId,
        wepId: data.wepId,
        seq,
        profileName: data.profileName,
        ATK: data.ATK,
        HIT: data.HIT,
        DMG: data.DMG,
        WR: data.WR,
      }
    })
  }

  async updateProfile(wepprofileId: string, data: any) {
    return this.prisma.weaponProfile.update({
      where: { wepprofileId },
      data: {
        seq: data.seq,
        profileName: data.profileName,
        ATK: data.ATK,
        HIT: data.HIT,
        DMG: data.DMG,
        WR: data.WR,
      }
    })
  }

  async deleteProfile(wepprofileId: string) {
    return this.prisma.weaponProfile.delete({ where: { wepprofileId } })
  }

  async fixProfileSeqs(wepId: string) {
    const profiles = await this.prisma.weaponProfile.findMany({
      where: { wepId },
      orderBy: [{ seq: 'asc' }]
    })

    await Promise.all(
      profiles.map((p, index) =>
        this.prisma.weaponProfile.update({
          where: { wepprofileId: p.wepprofileId },
          data: { seq: index + 1 }
        })
      )
    )
  }
}

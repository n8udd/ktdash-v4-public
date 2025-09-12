import type { Killteam } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class KillteamRepository extends BaseRepository {
  async getKillteamRow(killteamId: string): Promise<Killteam | null> {
    return this.prisma.killteam.findUnique({
      where: { killteamId }
    })
  }

  async getKillteam(killteamId: string) {
    const killteam = await this.prisma.killteam.findUnique({
      where: {
        killteamId
      },
      include: {
        user: true,
        // Pull default roster directly via relation
        defaultRoster: true,
        opTypes: {
          include: {
            weapons: {
              include: {
                profiles: {
                  orderBy: { seq: 'asc' }
                }
              },
              orderBy:[
                { wepType: 'desc'},
                { seq: 'asc' },
              ]
            },
            options: {
              orderBy:[
                { seq: 'asc' },
              ]
            },
            abilities: true,
          },
          orderBy: { seq: 'asc' }
        },
        ploys: {
          orderBy: [
            { ployType: 'asc' },
            { seq: 'asc' }
          ]
        },
        // Only include spotlight rosters in the list; default is provided separately
        rosters: {
          where: { isSpotlight: true },
          include: {
            user: true,
            killteam: true
          }
        },
      }
    })

    if (!killteam) return null;

    // Map prisma `rosters` to domain `spotlightRosters` expected by Killteam model
    const mappedKillteam: any = {
      ...killteam,
      spotlightRosters: killteam.rosters,
    }
    delete mappedKillteam.rosters

    // Fetch equipments separately to handle the universal ones (killteamid NULL means universal)
    const equipments = await this.prisma.equipment.findMany({
      where: {
        OR: [
          { killteamId: killteam.killteamId },
          { killteamId: null }
        ]
      },
      orderBy: { seq: 'asc' }
    });
    mappedKillteam.equipments = equipments

    return mappedKillteam
  }

  async getAllKillteams() {
    const killteams = await this.prisma.killteam.findMany({
      where: {
        isPublished: true
      },
      include: {
        user: true,
        // Include default roster directly to avoid N+1 and old id-matching logic
        defaultRoster: true,
      },
      orderBy: [{ seq: 'asc' }, { killteamName: 'asc' }],
    });

    return killteams;
  }

  async createKillteam(data: any) {
    return this.prisma.killteam.create({
      data: {
        killteamId: data.killteamId,
        factionId: data.factionId,
        killteamName: data.killteamName,
        description: data.description ?? '',
        composition: data.composition ?? '',
        archetypes: data.archetypes ?? null,
        userId: data.userId ?? null,
        isPublished: data.isPublished ?? true,
        seq: 200,
      }
    })
  }

  async updateKillteam(killteamId: string, data: any) {
    return this.prisma.killteam.update({
      where: { killteamId },
      data: {
        killteamName: data.killteamName,
        description: data.description,
        composition: data.composition,
        archetypes: data.archetypes,
        isPublished: data.isPublished,
      }
    })
  }

  async deleteKillteam(killteamId: string) {
    return this.prisma.killteam.delete({ where: { killteamId } })
  }
}

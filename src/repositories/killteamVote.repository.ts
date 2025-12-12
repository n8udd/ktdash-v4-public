import { BaseRepository } from './base.repository'

export class KillteamVoteRepository extends BaseRepository {
  async upsertVote(killteamId: string, userId: string, value: number) {
    return this.prisma.killteamVote.upsert({
      where: { killteamId_userId: { killteamId, userId } },
      create: { killteamId, userId, value },
      update: { value },
    })
  }

  async deleteVote(killteamId: string, userId: string) {
    await this.prisma.killteamVote.deleteMany({
      where: { killteamId, userId },
    })
  }

  async getUserVotes(killteamIds: string[], userId: string) {
    if (!killteamIds.length) return []

    return this.prisma.killteamVote.findMany({
      where: {
        killteamId: { in: killteamIds },
        userId,
      },
      select: {
        killteamId: true,
        value: true,
      },
    })
  }

  async getVoteSummaries(killteamIds: string[]) {
    if (!killteamIds.length) return []

    return this.prisma.killteamVote.groupBy({
      by: ['killteamId'],
      where: { killteamId: { in: killteamIds } },
      _count: { _all: true },
      _sum: { value: true },
    })
  }
}

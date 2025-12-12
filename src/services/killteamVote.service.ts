import { KillteamVoteRepository } from '@/src/repositories/killteamVote.repository'

export type KillteamVoteValue = 'up' | 'down'

export type KillteamVoteSummary = {
  upvotes: number
  downvotes: number
  total: number
  ratio: number
}

type VoteState = {
  voteSummary: KillteamVoteSummary
  userVote: KillteamVoteValue | null
}

export class KillteamVoteService {
  private static repository = new KillteamVoteRepository()

  private static computeSummary(total: number, sumValue: number | null): KillteamVoteSummary {
    if (!total) {
      return { upvotes: 0, downvotes: 0, total: 0, ratio: 0 }
    }

    const sum = sumValue ?? 0
    const upvotes = Math.round((total + sum) / 2)
    const downvotes = Math.max(total - upvotes, 0)
    const ratio = total > 0 ? upvotes / total : 0

    return { upvotes, downvotes, total, ratio }
  }

  static async getSummaries(killteamIds: string[]) {
    const summaries = await this.repository.getVoteSummaries(killteamIds)
    const byKillteam: Record<string, KillteamVoteSummary> = {}

    summaries.forEach((row: { _count: { _all: number }; _sum: { value: number | null }; killteamId: string | number }) => {
      const total = row._count?._all ?? 0
      const sum = row._sum?.value ?? 0
      byKillteam[row.killteamId] = this.computeSummary(total, sum)
    })

    return byKillteam
  }

  static async getUserVotes(killteamIds: string[], userId: string) {
    if (!userId) return {}
    const votes = await this.repository.getUserVotes(killteamIds, userId)
    const map: Record<string, KillteamVoteValue> = {}
    votes.forEach(({ killteamId, value }: { killteamId: string; value: number }) => {
      map[killteamId] = value > 0 ? 'up' : 'down'
    })
    return map
  }

  static async getVoteState(killteamId: string, userId?: string): Promise<VoteState> {
    const [summaries, userVotes] = await Promise.all([
      this.getSummaries([killteamId]),
      userId ? this.getUserVotes([killteamId], userId) : ({} as Record<string, KillteamVoteValue | null>),
    ])

    return {
      voteSummary: summaries[killteamId] ?? { upvotes: 0, downvotes: 0, total: 0, ratio: 0 },
      userVote: userVotes[killteamId] ?? null,
    }
  }

  static async castVote(killteamId: string, userId: string, vote: KillteamVoteValue): Promise<VoteState> {
    const value = vote === 'up' ? 1 : -1
    await this.repository.upsertVote(killteamId, userId, value)
    return this.getVoteState(killteamId, userId)
  }

  static async clearVote(killteamId: string, userId: string): Promise<VoteState> {
    await this.repository.deleteVote(killteamId, userId)
    return this.getVoteState(killteamId, userId)
  }
}

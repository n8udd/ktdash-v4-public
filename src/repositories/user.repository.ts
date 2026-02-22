import type { User } from '@prisma/client'
import { BaseRepository } from './base.repository'

export class UserRepository extends BaseRepository {
  async getUserRow(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { userId }
    })
  }

  async getUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { userId },
      //include: {
      //  rosters: {
      //    include: {
      //      killteam: true
      //    },
      //    orderBy: { seq: 'asc' }
      //  }
      //}
    })
  }

  async getUserByUsername(userName: string) {
    // Use findFirst instead of findUnique because findFirst uses case-sensitive matching
    // Decode in case Next.js passes the URL-encoded param without decoding it first
    const decoded = decodeURIComponent(userName)
    return this.prisma.user.findFirst({
      where: { userName: decoded },
      include: {
        rosters: {
          include: {
            killteam: true,
            user: {
              select: {
                userId: true,
                userName: true
              }
            }
          },
          orderBy: { seq: 'asc' }
        },
        killteams: true
      }
    })
  }
}

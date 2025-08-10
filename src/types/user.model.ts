import { Killteam, KillteamPlain, Roster, RosterPlain } from '.'

export type UserPlain = {
  userId: string
  email?: string | null
  userName?: string | null
  rosters?: RosterPlain[] | null
  killteams?: KillteamPlain[] | null
}

export class User {
  userId: string
  email?: string | null
  userName: string
  rosters?: Roster[] | null
  killteams?: Killteam[] | null

  constructor(data: {
    userId: string
    email: string | null
    userName: string
    rosters?: Roster[] | null
    killteams?: Killteam[] | null
  }) {
    this.userId = data.userId
    this.email = data.email
    this.userName = data.userName
    this.rosters = data.rosters?.map(roster => roster instanceof Roster ? roster : new Roster(roster))
    this.killteams = data.killteams?.map(killteam => killteam instanceof Killteam ? killteam : new Killteam(killteam))
  }

  toPlain(): UserPlain {
    return {
      userId: this.userId,
      email: this.email,
      userName: this.userName,
      rosters: this.rosters?.map((roster) => roster.toPlain()),
      killteams: this.killteams?.map((killteam) => killteam.toPlain()),
    }
  }
}

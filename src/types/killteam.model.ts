import { OpType, OpTypePlain, Roster, RosterPlain, User, UserPlain } from '.'
import { Equipment, EquipmentPlain } from './equipment.model'
import { Ploy, PloyPlain } from './ploy.model'

export type KillteamPlain = {
  factionId: string
  killteamId: string
  killteamName: string
  description: string
  composition: string
  archetypes?: string
  userId?: string
  isPublished?: boolean
  defaultRosterId?: string | null
  isHomebrew: boolean
  user?: UserPlain | null
  defaultRoster?: RosterPlain | null
  opTypes: OpTypePlain[]
  ploys: PloyPlain[]
  spotlightRosters: RosterPlain[]
  equipments: EquipmentPlain[]
}

export class Killteam {
  factionId: string
  killteamId: string
  killteamName: string
  description: string
  composition: string
  archetypes?: string
  userId?: string
  defaultRosterId?: string | null
  isPublished?: boolean
  user?: User | null
  defaultRoster?: Roster | null
  opTypes: OpType[]
  ploys: Ploy[]
  spotlightRosters: Roster[]
  equipments: Equipment[]

  constructor(data: {
    factionId: string
    killteamId: string
    killteamName: string
    description: string
    composition: string
    archetypes?: string
    userId?: string
    defaultRosterId?: string | null
    isPublished?: boolean
    user?: User | null
    defaultRoster?: Roster | null
    opTypes: OpType[]
    ploys: Ploy[]
    spotlightRosters: Roster[]
    equipments: Equipment[]
  }) {
    this.factionId = data.factionId
    this.killteamId = data.killteamId
    this.killteamName = data.killteamName
    this.description = data.description
    this.composition = data.composition
    this.archetypes = data.archetypes
    this.defaultRosterId = data.defaultRosterId
    this.defaultRoster = data.defaultRoster ? (data.defaultRoster instanceof Roster ? data.defaultRoster : new Roster(data.defaultRoster)) : null
    this.userId = data.userId
    this.isPublished = data.isPublished ?? true
    this.user = data.user ? (data.user instanceof User ? data.user : new User(data.user)) : null
    this.opTypes = data.opTypes?.map(opType => opType instanceof OpType ? opType : new OpType(opType))
    this.ploys = data.ploys?.map(ploy => ploy instanceof Ploy ? ploy : new Ploy(ploy))
    this.spotlightRosters = data.spotlightRosters?.map(roster => roster instanceof Roster ? roster : new Roster(roster))
    this.equipments = data.equipments?.map(eq => eq instanceof Equipment ? eq : new Equipment(eq))
  }
  
  get isHomebrew(): boolean {
    return this.factionId === 'HBR'
  }

  toPlain(): KillteamPlain {
    return {
      factionId: this.factionId,
      killteamId: this.killteamId,
      killteamName: this.killteamName,
      description: this.description,
      composition: this.composition,
      archetypes: this.archetypes,
      defaultRosterId: this.defaultRosterId,
      defaultRoster: this.defaultRoster?.toPlain() ?? null,
      userId: this.userId,
      isPublished: this.isPublished,
      user: this.user?.toPlain(),
      isHomebrew: this.isHomebrew,
      opTypes: this.opTypes?.map((opType) => opType.toPlain()),
      ploys: this.ploys?.map((ploy) => ploy.toPlain()),
      spotlightRosters: this.spotlightRosters?.map((roster) => roster.toPlain()),
      equipments: this.equipments?.map((eq) => eq.toPlain()),
    }
  }
}

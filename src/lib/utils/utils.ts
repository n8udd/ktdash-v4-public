import { AbilityPlain, OpPlain, OptionPlain, OpType, OpTypePlain, RosterPlain } from '@/types'
import { customAlphabet } from 'nanoid'

export function toLocalIsoDate(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().split('T')[0] // YYYY-MM-DD
}

export function getRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function ucwords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase())
}

// Define your safe alphabet
const SAFE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz'

// Create a reusable generator
const generateId = customAlphabet(SAFE_ALPHABET, 10) // change length if needed

// Export a wrapper function
export function genId(): string {
  return generateId()
}

export function getShortOpTypeName(op : OpType | OpTypePlain | null | undefined): string | null | undefined {
  if (op == null || op.opTypeName == null) {
    // covers both null and undefined
    return op?.opTypeName;
  }

  if (op.killteamId.includes('INQ')) {
    // Use full names for Inquisition
    return op.opTypeName;
  }

  return op.opTypeName
    .replace("Aquilon ", "")
    .replace("Arbites ", "")
    .replace("Battleclade ", "")
    .replace("Battleclade ", "")
    .replace("Brood Brother ", "")
    .replace("Death Korps ", "")
    .replace(" Drone", "")
    .replace("Fellgor ", "")
    .replace("Goremonger ", "")
    .replace("Hearthkyn ", "")
    .replace("Kabalite ", "")
    .replace("Kasrkin ", "")
    .replace("Kommando ", "")
    .replace("Kroot ", "")
    .replace("Legionary ", "")
    .replace("Legionary ", "")
    .replace("Mandrake ", "")
    .replace("Navis ", "")
    .replace("Night Lord ", "")
    .replace("Novitiate ", "")
    .replace(" Pathfinder", "")
    .replace("Plague Marine ", "")
    .replace("Plasmacyte ", "")
    .replace("Ratling ", "")
    .replace("Ravener ", "")
    .replace("Sanctifier ", "")
    .replace("Scout ", "")
    .replace("Space Hulk Veteran ", "")
    .replace("Traitor ", "")
    .replace("Vespid ", "")
    .replace("Voidscarred ", "")
    .replace("Warpdiver ", "")
    .replace("Yaegir ", "");
}

export function sanitizeFileName(fileName: string): string {
  // Remove any character that isn't a letter, number, space, or hyphen
  return fileName
    .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric characters (except spaces and hyphens)
    .replace(/[\s_-]+/g, '_') // Replace spaces or multiple underscores with a single underscore
    .toLowerCase(); // Optionally make it lowercase for consistency
}

export function getOpUniqueAbilitiesAndOptions(roster?: RosterPlain, op?: OpPlain) {
  const allOps: OpPlain[] = roster?.ops?.filter((op) => op.isDeployed) || []

  if (!op || !roster) {
    return { abilities: [], options: [] }
  }

  const keyOfAbility = (a: AbilityPlain) => a.abilityName
  const keyOfOption  = (o: OptionPlain) => o.optionName

  const otherAbilityKeys = new Set<string>()
  const otherOptionKeys  = new Set<string>()

  for (const other of allOps) {
    if (!other || other.opId === op.opId) continue
    for (const a of other.abilities ?? []) otherAbilityKeys.add(keyOfAbility(a))
    for (const o of other.options ?? [])   otherOptionKeys.add(keyOfOption(o))
  }

  // (Optional) de-dupe within this op using a seen set
  const seenA = new Set<string>()
  const seenO = new Set<string>()

  const uniqueAbilities = (op.abilities ?? []).filter(a => {
    const k = keyOfAbility(a)
    if (seenA.has(k)) return false
    seenA.add(k)
    return !otherAbilityKeys.has(k)
  })

  const uniqueOptions = (op.options ?? []).filter(o => {
    const k = keyOfOption(o)
    if (seenO.has(k)) return false
    seenO.add(k)
    return !otherOptionKeys.has(k)
  })

  return { abilities: uniqueAbilities, options: uniqueOptions }
}

export function getRosterRepeatedAbilitiesAndOptions(roster: RosterPlain | undefined) {
  if (!roster)
  {
    return { abilities: [], options: []}
  }
  const allOps: OpPlain[] = roster.ops?.filter((op) => op.isDeployed) || []

  // Count occurrences by ID, and remember a representative item for output
  const abilityCount = new Map<string, number>()
  const optionCount  = new Map<string, number>()
  const abilityFirst = new Map<string, AbilityPlain>()
  const optionFirst  = new Map<string, OptionPlain>()

  for (const op of allOps) {
    for (const a of op?.abilities ?? []) {
      const id = a.abilityName
      if (!abilityFirst.has(id)) abilityFirst.set(id, a)
      abilityCount.set(id, (abilityCount.get(id) ?? 0) + 1)
    }
    for (const o of op?.options ?? []) {
      const id = o.optionName
      if (!optionFirst.has(id)) optionFirst.set(id, o)
      optionCount.set(id, (optionCount.get(id) ?? 0) + 1)
    }
  }

  // Collect repeated items once, in first-seen order
  const abilities: AbilityPlain[] = []
  const options: OptionPlain[] = []
  const addedA = new Set<string>()
  const addedO = new Set<string>()

  for (const op of allOps) {
    for (const a of op?.abilities ?? []) {
      const id = a.abilityName
      if (!addedA.has(id) && (abilityCount.get(id) ?? 0) > 1) {
        abilities.push(abilityFirst.get(id)!)
        addedA.add(id)
      }
    }
    for (const o of op?.options ?? []) {
      const id = o.optionName
      if (!addedO.has(id) && (optionCount.get(id) ?? 0) > 1) {
        options.push(optionFirst.get(id)!)
        addedO.add(id)
      }
    }
  }

  return { abilities, options }
}

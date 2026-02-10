export type AbilityPlain = {
  abilityId: string
  opTypeId: string
  abilityName: string
  AP?: number
  description: string
  isFactionRule: boolean
}

export class Ability {
  abilityId: string
  opTypeId: string
  abilityName: string
  AP?: number
  description: string
  isFactionRule: boolean

  constructor(data: {
    abilityId: string
    opTypeId: string
    abilityName: string
    AP?: number
    description: string
    isFactionRule: boolean
  }) {
    this.abilityId = data.abilityId
    this.opTypeId = data.opTypeId
    this.abilityName = data.abilityName
    this.AP = data.AP
    this.description = data.description
    this.isFactionRule = data.isFactionRule
  }

  toPlain(): AbilityPlain {
    return {
      abilityId: this.abilityId,
      opTypeId: this.opTypeId,
      abilityName: this.abilityName,
      AP: this.AP,
      description: this.description,
      isFactionRule: this.isFactionRule
    }
  }
}

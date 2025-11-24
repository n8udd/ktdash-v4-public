// @ts-nocheck
import { OptionRepository } from '@/src/repositories/option.repository'
import { Option } from '@/types'

export class OptionService {
  private static repository = new OptionRepository()

  static async getOptionRow(optionId: string): Promise<Option | null> {
    const row = await this.repository.getOptionRow(optionId)
    return row ? new Option(row as any) : null
  }

  static async getOption(optionId: string): Promise<Option | null> {
    const row = await this.repository.getOption(optionId)
    return row ? new Option(row as any) : null
  }

  static async getOpType(opTypeId: string) {
    return this.repository.getOpType(opTypeId)
  }

  static async createOption(data: any): Promise<Option | null> {
    const row = await this.repository.createOption(data)
    return row ? new Option(row as any) : null
  }

  static async updateOption(optionId: string, data: any): Promise<Option | null> {
    const row = await this.repository.updateOption(optionId, data)
    return row ? new Option(row as any) : null
  }

  static async deleteOption(optionId: string): Promise<void> {
    await this.repository.deleteOption(optionId)
  }

  static async countForOpType(opTypeId: string): Promise<number> {
    return this.repository.countForOpType(opTypeId)
  }

  static async fixOptionSeqs(opTypeId: string): Promise<void> {
    await this.repository.fixOptionSeqs(opTypeId)
  }
}

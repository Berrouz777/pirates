import type { BonusRouletteResult, ElementType } from '../../../app/modules/game/wheel'

export type NonBonusElementType = Exclude<ElementType, 'bonus-game' | 'bonus-scatter'>

export type ElementCounts = Record<ElementType, number>

export interface DropResolution {
    survivors: ElementCounts
    removedTotal: number
    removedBonus: number
}

export interface ExplodingGroup {
    type: ElementType
    count: number
}

export interface GeneratedDropTemplate {
    counts: Record<string, number>
    explodingGroups: ExplodingGroup[]
    bonusProgress: number
}

export interface GeneratedSpinTemplate {
    id: string
    drops: GeneratedDropTemplate[]
    bonusTriggered: boolean
    bonusRouletteResult: BonusRouletteResult | null
    maxScatterOnBoardInSpin: number
}

export interface RandomSpinGeneratorInput {
    bonusProgress: number
    spinNumber: number
    allowScatter: boolean
}

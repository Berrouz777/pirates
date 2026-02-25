import type { ElementType } from './element.types'

export interface WinResult {
    type: ElementType
    count: number
}

export interface ResolveWinsResult {
    board: ElementType[]
    wins: WinResult[]
}

export type BonusRouletteCellKey =
    | 'empty'
    | 'freespin-5'
    | 'multiple-15'
    | 'multiple-2'
    | 'multiple-5'
    | 'cash-10'
    | 'cash-25'
    | 'cash-50'
    | 'cash-100'
    | 'cash-500'
    | 'cash-1000'

export type BonusRoulettePrizeType = 'empty' | 'freespins' | 'multiple' | 'cash'

export interface BonusRouletteResult {
    cellKey: BonusRouletteCellKey
    cellIndex: number
    prizeType: BonusRoulettePrizeType
    freeSpinsCount: number | null
    multipleValue: number | null
    cashMultiplier: number | null
    cashAmount: number | null
}

export interface ActiveBonusEffect {
    prizeType: Exclude<BonusRoulettePrizeType, 'empty' | 'cash'>
    remainingSpins: number
    freeSpinsCount: number | null
    multipleValue: number | null
}

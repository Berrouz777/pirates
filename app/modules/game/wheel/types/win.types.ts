export type BonusRouletteCellKey =
    | 'empty'
    | 'freespin-5'
    | 'multiple-1.5'
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
    prizeType: BonusRoulettePrizeType
    freeSpinsCount: number | null
    multipleValue: number | null
    cashMultiplier: number | null
    cashAmount: number | null
}

export interface ActiveFreespinsEffect {
    prizeType: 'freespins'
    remainingSpins: number
}

export interface ActiveMultipleEffect {
    prizeType: 'multiple'
    remainingSpins: number
    multipleValue: number
}

export type ActiveBonusEffect = ActiveFreespinsEffect | ActiveMultipleEffect

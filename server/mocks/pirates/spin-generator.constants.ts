import type { BonusRouletteResult, ElementType } from '../../../app/modules/game/wheel'
import type { NonBonusElementType } from './spin-generator.types'

export const BONUS_PROGRESS_MAX = 100
export const MIN_SCATTER_GROUP_SIZE = 4
export const MAX_ACTION_DROPS = 3
export const MAX_BONUS_PER_ACTION = 8
export const MAX_BUILD_ATTEMPTS = 30

export const REGULAR_ELEMENTS: NonBonusElementType[] = ['wheel', 'bomb', 'sword', 'shield', 'musketoon', 'keg', 'tankard', 'cannon']

export const ALL_ELEMENTS: ElementType[] = [...REGULAR_ELEMENTS, 'bonus-game', 'bonus-scatter']

export const MIN_EXPLODING_GROUP_SIZE_BY_ELEMENT: Record<NonBonusElementType, number> = {
    shield: 13,
    sword: 13,
    tankard: 13,
    wheel: 14,
    musketoon: 14,
    cannon: 15,
    keg: 16,
    bomb: 16
}

export const ELEMENT_PROBABILITIES_PERCENT: Record<ElementType, number> = {
    'shield': 10,
    'sword': 10,
    'tankard': 10,
    'wheel': 10,
    'musketoon': 10,
    'cannon': 10,
    'keg': 14,
    'bomb': 14.25,
    'bonus-game': 2.5,
    'bonus-scatter': 9.25
}

// Допуск на погрешность суммы весов из-за float-арифметики.
export const PROGRESS_ROULETTE_TOTAL_WEIGHT = 100
export const PROGRESS_ROULETTE_WEIGHT_EPSILON = 1e-6

export const PROGRESS_ROULETTE_WEIGHTS: Array<{ cellKey: Exclude<BonusRouletteResult['cellKey'], 'empty'>; weight: number }> = [
    { cellKey: 'freespin-5', weight: 15.0 },
    { cellKey: 'freespin-10', weight: 7.5 },
    { cellKey: 'multiple-1.5', weight: 15.0 },
    { cellKey: 'multiple-2', weight: 7.5 },
    { cellKey: 'multiple-5', weight: 5.0 },
    { cellKey: 'cash-10', weight: 27.9 },
    { cellKey: 'cash-25', weight: 14.0 },
    { cellKey: 'cash-50', weight: 5.0 },
    { cellKey: 'cash-100', weight: 2.5 },
    { cellKey: 'cash-500', weight: 0.5 },
    { cellKey: 'cash-1000', weight: 0.1 }
]

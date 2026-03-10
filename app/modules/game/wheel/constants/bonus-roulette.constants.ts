import type { BonusRouletteCellKey } from '../types'

export const BONUS_ROULETTE_CELLS: BonusRouletteCellKey[] = [
    'empty',
    'freespin-5',
    'freespin-10',
    'multiple-1.5',
    'multiple-2',
    'multiple-5',
    'cash-10',
    'cash-25',
    'cash-50',
    'cash-100',
    'cash-500',
    'cash-1000'
]

export const MULTIPLE_VALUE_BY_KEY: Record<'multiple-1.5' | 'multiple-2' | 'multiple-5', number> = {
    'multiple-1.5': 1.5,
    'multiple-2': 2,
    'multiple-5': 5
}

export const CASH_MULTIPLIER_BY_KEY: Record<'cash-10' | 'cash-25' | 'cash-50' | 'cash-100' | 'cash-500' | 'cash-1000', number> = {
    'cash-10': 10,
    'cash-25': 25,
    'cash-50': 50,
    'cash-100': 100,
    'cash-500': 500,
    'cash-1000': 1000
}

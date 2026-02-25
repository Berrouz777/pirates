import type { Ref } from 'vue'
import type { ActiveBonusEffect, BonusRouletteCellKey, BonusRouletteResult } from '../types'
import { BONUS_ROULETTE_CELLS, CASH_MULTIPLIER_BY_KEY, MULTIPLE_VALUE_BY_KEY } from '../constants'

interface UseBonusRouletteOptions {
    bet: Ref<number>
    bonusRouletteResult: Ref<BonusRouletteResult | null>
    activeBonusEffect: Ref<ActiveBonusEffect | null>
}

const randomItem = <T>(items: T[]) => {
    const randomIndex = Math.floor(Math.random() * items.length)
    return items[randomIndex]!
}

export const useBonusRoulette = ({ bet, bonusRouletteResult, activeBonusEffect }: UseBonusRouletteOptions) => {
    const getAverageBetToReachBonusGame = () => {
        // TODO: заменить на реальную формулу после согласования контракта с бэкендом.
        return bet.value
    }

    const buildBonusRouletteResult = (cellKey: BonusRouletteCellKey): BonusRouletteResult => {
        const cellIndex = BONUS_ROULETTE_CELLS.indexOf(cellKey)
        const averageBet = getAverageBetToReachBonusGame()

        if (cellKey === 'empty') {
            return {
                cellKey,
                cellIndex,
                prizeType: 'empty',
                freeSpinsCount: null,
                multipleValue: null,
                cashMultiplier: null,
                cashAmount: null
            }
        }

        if (cellKey === 'freespin-5') {
            return {
                cellKey,
                cellIndex,
                prizeType: 'freespins',
                freeSpinsCount: 5,
                multipleValue: null,
                cashMultiplier: null,
                cashAmount: null
            }
        }

        if (cellKey === 'multiple-15' || cellKey === 'multiple-2' || cellKey === 'multiple-5') {
            const multipleValue = MULTIPLE_VALUE_BY_KEY[cellKey]

            return {
                cellKey,
                cellIndex,
                prizeType: 'multiple',
                freeSpinsCount: null,
                multipleValue,
                cashMultiplier: null,
                cashAmount: null
            }
        }

        const cashMultiplier = CASH_MULTIPLIER_BY_KEY[cellKey]

        return {
            cellKey,
            cellIndex,
            prizeType: 'cash',
            freeSpinsCount: null,
            multipleValue: null,
            cashMultiplier,
            cashAmount: cashMultiplier * averageBet
        }
    }

    const prepareBonusRouletteResult = () => {
        const mockCellKey = randomItem(BONUS_ROULETTE_CELLS)
        const result = buildBonusRouletteResult(mockCellKey)
        bonusRouletteResult.value = result

        return result
    }

    const applyBonusRouletteResult = (result: BonusRouletteResult) => {
        if (result.prizeType === 'freespins') {
            activeBonusEffect.value = {
                prizeType: 'freespins',
                remainingSpins: result.freeSpinsCount ?? 0,
                freeSpinsCount: result.freeSpinsCount,
                multipleValue: null
            }
            return
        }

        if (result.prizeType === 'multiple') {
            activeBonusEffect.value = {
                prizeType: 'multiple',
                remainingSpins: 10,
                freeSpinsCount: null,
                multipleValue: result.multipleValue
            }
            return
        }

        activeBonusEffect.value = null
    }

    const clearBonusRouletteResult = () => {
        bonusRouletteResult.value = null
    }

    return {
        prepareBonusRouletteResult,
        applyBonusRouletteResult,
        clearBonusRouletteResult
    }
}

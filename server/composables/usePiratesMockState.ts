import type { ActiveBonusEffect, BonusRouletteResult, InitGameResponse, SpinDrop, SpinScenarioResponse } from '../../app/modules/game/wheel'

import initStateJson from '../mocks/pirates/init-state.json'
import { generateRandomSpinTemplate } from '../mocks/pirates/spin-generator'

interface MockState {
    balance: number
    bonusProgress: number
    activeBonusEffect: ActiveBonusEffect | null
    spinCounter: number
    betSumToBonus: number
    paidSpinsToBonus: number
}

const GROUP_MULTIPLIER_BY_SIZE: Record<number, number> = {
    10: 1.25,
    11: 1.5,
    12: 2,
    13: 2.5,
    14: 3,
    15: 4,
    16: 6
}

const initState = initStateJson as InitGameResponse

const state: MockState = {
    balance: initState.balance,
    bonusProgress: initState.bonusProgress,
    activeBonusEffect: initState.activeBonusEffect,
    spinCounter: 0,
    betSumToBonus: 0,
    paidSpinsToBonus: 0
}

const roundMoney = (value: number) => Math.round(value * 100) / 100

const getMultiplierByGroupSize = (groupSize: number): number => {
    if (groupSize >= 16) {
        return GROUP_MULTIPLIER_BY_SIZE[16] ?? 0
    }
    return GROUP_MULTIPLIER_BY_SIZE[groupSize] ?? 0
}

const createActiveBonusByRoulette = (result: BonusRouletteResult | null): ActiveBonusEffect | null => {
    if (!result || result.prizeType === 'empty' || result.prizeType === 'cash') {
        return null
    }

    if (result.prizeType === 'freespins') {
        return {
            prizeType: 'freespins',
            remainingSpins: result.freeSpinsCount ?? 0
        }
    }

    return {
        prizeType: 'multiple',
        remainingSpins: 10,
        multipleValue: result.multipleValue ?? 1
    }
}

const consumeActiveBonusSpin = () => {
    if (!state.activeBonusEffect || state.activeBonusEffect.remainingSpins <= 0) {
        return
    }

    state.activeBonusEffect = {
        ...state.activeBonusEffect,
        remainingSpins: state.activeBonusEffect.remainingSpins - 1
    }

    if (state.activeBonusEffect.remainingSpins <= 0) {
        state.activeBonusEffect = null
    }
}

export const usePiratesMockState = () => {
    const reset = () => {
        state.balance = initState.balance
        state.bonusProgress = initState.bonusProgress
        state.activeBonusEffect = initState.activeBonusEffect
        state.spinCounter = 0
        state.betSumToBonus = 0
        state.paidSpinsToBonus = 0
    }

    const getInitState = (): InitGameResponse => {
        reset()

        return {
            board: [...initState.board],
            balance: initState.balance,
            bet: initState.bet,
            bonusProgress: initState.bonusProgress,
            activeBonusEffect: initState.activeBonusEffect
        }
    }

    const getNextSpinScenario = (bet: number): SpinScenarioResponse => {
        const safeBet = Number.isFinite(bet) && bet > 0 ? bet : initState.bet

        const isFreeSpin = state.activeBonusEffect?.prizeType === 'freespins' && state.activeBonusEffect.remainingSpins > 0
        const activeMultiple = state.activeBonusEffect?.prizeType === 'multiple' ? state.activeBonusEffect.multipleValue : 1

        const currentTemplate = generateRandomSpinTemplate({
            bonusProgress: state.bonusProgress,
            spinNumber: state.spinCounter
        })
        state.spinCounter += 1

        let totalWin = 0

        const drops: SpinDrop[] = currentTemplate.drops.map((dropTemplate) => {
            let dropWin = 0

            const explodingGroups = dropTemplate.explodingGroups.map((group) => {
                const rewardAmount = roundMoney(getMultiplierByGroupSize(group.count) * activeMultiple)
                dropWin = roundMoney(dropWin + rewardAmount)
                totalWin = roundMoney(totalWin + rewardAmount)
                return { ...group, rewardAmount }
            })

            return {
                counts: dropTemplate.counts as SpinDrop['counts'],
                explodingGroups,
                win: dropWin,
                bonusProgress: dropTemplate.bonusProgress
            }
        })

        if (!isFreeSpin) {
            state.balance = roundMoney(state.balance - safeBet)
            state.betSumToBonus += safeBet
            state.paidSpinsToBonus += 1
        }
        const lastDrop = currentTemplate.drops[currentTemplate.drops.length - 1]
        const nextProgress = lastDrop?.bonusProgress ?? state.bonusProgress
        state.bonusProgress = currentTemplate.bonusTriggered ? 0 : nextProgress

        const averageBetToBonus = state.paidSpinsToBonus > 0 ? state.betSumToBonus / state.paidSpinsToBonus : safeBet
        const resolvedBonusRouletteResult =
            currentTemplate.bonusTriggered && currentTemplate.bonusRouletteResult?.prizeType === 'cash'
                ? {
                      ...currentTemplate.bonusRouletteResult,
                      cashAmount: roundMoney((currentTemplate.bonusRouletteResult.cashMultiplier ?? 0) * averageBetToBonus)
                  }
                : currentTemplate.bonusRouletteResult

        const nextBonusEffect = createActiveBonusByRoulette(resolvedBonusRouletteResult)
        if (currentTemplate.bonusTriggered) {
            state.activeBonusEffect = nextBonusEffect
            state.betSumToBonus = 0
            state.paidSpinsToBonus = 0
        } else {
            consumeActiveBonusSpin()
        }

        return {
            spinId: currentTemplate.id,
            drops,
            win: totalWin,
            balance: state.balance,
            averageBetToBonus: roundMoney(averageBetToBonus),
            bonusTriggered: currentTemplate.bonusTriggered,
            bonusRouletteResult: resolvedBonusRouletteResult,
            activeBonusEffect: state.activeBonusEffect
        }
    }

    return {
        getInitState,
        getNextSpinScenario
    }
}

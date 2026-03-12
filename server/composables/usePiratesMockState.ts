import type { ActiveBonusEffect, BonusRouletteResult, ElementType, InitGameResponse, SpinDrop, SpinScenarioResponse } from '../../app/modules/game/wheel'

import initStateJson from '../mocks/pirates/init-state.json'
import { generateRandomSpinTemplate } from '../mocks/pirates/spin-generator'
import { ELEMENT_MULTIPLIER_BY_GROUP_SIZE, MAX_GROUP_SIZE_FOR_MULTIPLIER } from './pirates-mock-state.constants'
import type { MockState } from './pirates-mock-state.types'

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

const getMultiplierByElementGroupSize = (elementType: ElementType, groupSize: number): number => {
    if (elementType === 'bonus-game' || elementType === 'bonus-scatter') {
        return 0
    }

    const normalizedGroupSize = Math.floor(groupSize)
    if (!Number.isFinite(normalizedGroupSize) || normalizedGroupSize <= 0) {
        return 0
    }

    const cappedGroupSize = Math.min(normalizedGroupSize, MAX_GROUP_SIZE_FOR_MULTIPLIER)
    return ELEMENT_MULTIPLIER_BY_GROUP_SIZE[elementType]?.[cappedGroupSize] ?? 0
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

const createBonusRouletteResultByScatter = (scatterCount: number): BonusRouletteResult | null => {
    if (scatterCount < 4) {
        return null
    }

    const cappedScatterCount = Math.min(7, Math.floor(scatterCount))

    if (cappedScatterCount === 4) {
        return {
            cellKey: 'freespin-5',
            prizeType: 'freespins',
            triggerSource: 'scatter',
            freeSpinsCount: 5,
            multipleValue: null,
            cashMultiplier: null,
            cashAmount: null
        }
    }

    if (cappedScatterCount === 5) {
        return {
            cellKey: 'freespin-10',
            prizeType: 'freespins',
            triggerSource: 'scatter',
            freeSpinsCount: 10,
            multipleValue: null,
            cashMultiplier: null,
            cashAmount: null
        }
    }

    if (cappedScatterCount === 6) {
        return {
            cellKey: 'multiple-1.5',
            prizeType: 'multiple',
            triggerSource: 'scatter',
            freeSpinsCount: null,
            multipleValue: 1.5,
            cashMultiplier: null,
            cashAmount: null
        }
    }

    if (cappedScatterCount === 7) {
        return {
            cellKey: 'multiple-2',
            prizeType: 'multiple',
            triggerSource: 'scatter',
            freeSpinsCount: null,
            multipleValue: 2,
            cashMultiplier: null,
            cashAmount: null
        }
    }

    return null
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
        const isBonusGameActive = !!state.activeBonusEffect && state.activeBonusEffect.remainingSpins > 0

        if (state.activeBonusEffect && state.activeBonusEffect.remainingSpins > 0) {
            consumeActiveBonusSpin()
        }

        const currentTemplate = generateRandomSpinTemplate({
            bonusProgress: state.bonusProgress,
            spinNumber: state.spinCounter,
            allowScatter: !isBonusGameActive
        })
        state.spinCounter += 1

        const scatterBonusRouletteCandidate = createBonusRouletteResultByScatter(currentTemplate.maxScatterOnBoardInSpin)
        const scatterTriggersRoulette = !currentTemplate.bonusTriggered && !!scatterBonusRouletteCandidate

        let totalExplodeWin = 0

        const drops: SpinDrop[] = currentTemplate.drops.map((dropTemplate) => {
            let dropWin = 0

            const explodingGroups = dropTemplate.explodingGroups.map((group) => {
                const rewardAmount = roundMoney(safeBet * getMultiplierByElementGroupSize(group.type, group.count) * activeMultiple)
                dropWin = roundMoney(dropWin + rewardAmount)
                totalExplodeWin = roundMoney(totalExplodeWin + rewardAmount)
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
        const baseBonusRouletteResult = currentTemplate.bonusTriggered ? currentTemplate.bonusRouletteResult : scatterBonusRouletteCandidate
        const resolvedBonusRouletteResult =
            currentTemplate.bonusTriggered && baseBonusRouletteResult?.prizeType === 'cash'
                ? {
                      ...baseBonusRouletteResult,
                      cashAmount: roundMoney((baseBonusRouletteResult.cashMultiplier ?? 0) * averageBetToBonus)
                  }
                : baseBonusRouletteResult
        const cashWin = resolvedBonusRouletteResult?.prizeType === 'cash' ? (resolvedBonusRouletteResult.cashAmount ?? 0) : 0
        const totalWin = roundMoney(totalExplodeWin + cashWin)
        state.balance = roundMoney(state.balance + totalWin)

        const nextBonusEffect = createActiveBonusByRoulette(resolvedBonusRouletteResult)
        if (currentTemplate.bonusTriggered) {
            state.activeBonusEffect = nextBonusEffect
            state.betSumToBonus = 0
            state.paidSpinsToBonus = 0
        } else if (scatterTriggersRoulette) {
            state.activeBonusEffect = nextBonusEffect
        }

        return {
            spinId: currentTemplate.id,
            drops,
            win: totalWin,
            balance: state.balance,
            averageBetToBonus: roundMoney(averageBetToBonus),
            bonusTriggered: currentTemplate.bonusTriggered || scatterTriggersRoulette,
            bonusRouletteResult: resolvedBonusRouletteResult,
            activeBonusEffect: state.activeBonusEffect
        }
    }

    return {
        getInitState,
        getNextSpinScenario
    }
}

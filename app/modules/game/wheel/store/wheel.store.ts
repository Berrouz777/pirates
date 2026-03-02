import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { ActiveBonusEffect, AnimationMeta, BonusRouletteResult, CellValue, GamePhase } from '../types'
import { BONUS_PROGRESS_FULL_PAUSE_MS, DEFAULT_BET, START_BALANCE } from '../constants'
import { useActiveBonus, useAnimationTimings, useMoneyUtils, useSpinScenario } from '../composables'
import { useWheelApi } from '../api/wheel.api'

export const useWheelStore = defineStore('wheel', () => {
    // State
    const board = ref<CellValue[]>([])
    const isSpinning = ref<boolean>(false)
    const isInitializing = ref<boolean>(false)
    const isAutoSpinning = ref<boolean>(false)
    const lastWinAmount = ref<number>(0)
    const balance = ref<number>(START_BALANCE)
    const bet = ref<number>(DEFAULT_BET)
    const bonusProgress = ref<number>(0)
    const bonusIntroTrigger = ref<number>(0)
    const isBonusMode = ref<boolean>(false)
    const isBonusAnimationPlaying = ref<boolean>(false)
    const bonusRouletteResult = ref<BonusRouletteResult | null>(null)
    const activeBonusEffect = ref<ActiveBonusEffect | null>(null)
    const pendingBonusEffect = ref<ActiveBonusEffect | null>(null)
    const pendingCashWin = ref<number>(0)
    const phase = ref<GamePhase>('idle')
    const animationMeta = ref<AnimationMeta>({ removingIndices: [], spawnIndices: [], fallOffsetsByIndex: {}, rewardAnimations: [] })

    // Composables
    const api = useWheelApi()
    const { sleep } = useAnimationTimings()
    const { roundMoney } = useMoneyUtils()

    const { applyScenarioAnimations, resetAnimationMeta } = useSpinScenario({
        board,
        phase,
        animationMeta,
        lastWinAmount,
        onDropProgress: (progress) => {
            bonusProgress.value = progress
        }
    })

    const { hasFreeSpinAvailable } = useActiveBonus({ activeBonusEffect })

    // Actions
    const prepareBonusRouletteResult = () => bonusRouletteResult.value

    const applyBonusRouletteResult = () => {
        activeBonusEffect.value = pendingBonusEffect.value
        pendingBonusEffect.value = null
        if (pendingCashWin.value > 0) {
            lastWinAmount.value = roundMoney(lastWinAmount.value + pendingCashWin.value)
            pendingCashWin.value = 0
        }
    }

    const clearBonusRouletteResult = () => {
        bonusRouletteResult.value = null
        pendingCashWin.value = 0
    }

    const initBoard = async () => {
        isInitializing.value = true
        try {
            const initResponse = await api.init()
            board.value = [...initResponse.board]
            lastWinAmount.value = 0
            balance.value = initResponse.balance ?? START_BALANCE
            bet.value = initResponse.bet ?? DEFAULT_BET
            bonusProgress.value = initResponse.bonusProgress
            bonusIntroTrigger.value = 0
            isBonusMode.value = false
            isBonusAnimationPlaying.value = false
            bonusRouletteResult.value = null
            activeBonusEffect.value = initResponse.activeBonusEffect
            pendingBonusEffect.value = null
            pendingCashWin.value = 0
            phase.value = 'idle'
            resetAnimationMeta()
            isSpinning.value = false
            isAutoSpinning.value = false
        } finally {
            isInitializing.value = false
        }
    }

    const spin = async () => {
        const currentBet = bet.value
        if (isSpinning.value || (!hasFreeSpinAvailable() && balance.value < currentBet)) {
            return
        }

        isSpinning.value = true

        try {
            const scenario = await api.spin({ bet: currentBet })

            // Баланс берём как есть от сервера, списывается только ставка
            balance.value = scenario.balance

            await applyScenarioAnimations(scenario)

            if (scenario.bonusTriggered) {
                await sleep(BONUS_PROGRESS_FULL_PAUSE_MS)
                bonusProgress.value = 0
                stopAutoSpin()
                // Сохраняем эффект от сервера — применится после анимации рулетки
                pendingBonusEffect.value = scenario.activeBonusEffect
                bonusRouletteResult.value = scenario.bonusRouletteResult
                pendingCashWin.value = scenario.bonusRouletteResult?.prizeType === 'cash' ? (scenario.bonusRouletteResult.cashAmount ?? 0) : 0
                const winBeforeRoulette = pendingCashWin.value > 0 && scenario.win >= pendingCashWin.value ? scenario.win - pendingCashWin.value : scenario.win
                lastWinAmount.value = roundMoney(winBeforeRoulette)
                isBonusMode.value = true
                bonusIntroTrigger.value += 1
            } else {
                activeBonusEffect.value = scenario.activeBonusEffect
                pendingCashWin.value = 0
                lastWinAmount.value = scenario.win
            }
        } finally {
            resetAnimationMeta()
            phase.value = 'idle'
            isSpinning.value = false
        }
    }

    const stopAutoSpin = () => {
        isAutoSpinning.value = false
    }

    const startAutoSpin = async () => {
        if (isAutoSpinning.value || isSpinning.value || (balance.value < bet.value && !hasFreeSpinAvailable())) {
            return
        }

        isAutoSpinning.value = true

        while (isAutoSpinning.value && (balance.value >= bet.value || hasFreeSpinAvailable())) {
            await spin()
        }

        isAutoSpinning.value = false
    }

    return {
        board,
        isSpinning,
        isInitializing,
        isAutoSpinning,
        lastWinAmount,
        balance,
        bet,
        bonusProgress,
        bonusIntroTrigger,
        isBonusMode,
        isBonusAnimationPlaying,
        bonusRouletteResult,
        activeBonusEffect,
        phase,
        animationMeta,
        prepareBonusRouletteResult,
        applyBonusRouletteResult,
        clearBonusRouletteResult,
        initBoard,
        spin,
        startAutoSpin,
        stopAutoSpin
    }
})

import { storeToRefs } from 'pinia'

import { BONUS_PROGRESS_FULL_PAUSE_MS, DEFAULT_BET, START_BALANCE } from '../constants'
import { useWheelApi } from '../api/wheel.api'
import { useWheelStore } from '../store/wheel.store'
import { useActiveBonus } from './use-active-bonus'
import { useAnimationTimings } from './use-animation-timings'
import { useMoneyUtils } from './use-money-utils'
import { useSpinScenario } from './use-spin-scenario'

export const useWheelFlow = () => {
    const wheelStore = useWheelStore()
    const {
        board,
        isSpinning,
        isInitializing,
        isAutoSpinning,
        lastWinAmount,
        balance,
        pendingBalance,
        bet,
        bonusProgress,
        bonusIntroTrigger,
        isBonusMode,
        isBonusAnimationPlaying,
        bonusRouletteResult,
        activeBonusEffect,
        pendingBonusEffect,
        pendingCashWin,
        phase,
        animationMeta
    } = storeToRefs(wheelStore)

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

    const prepareBonusRouletteResult = () => bonusRouletteResult.value

    const applyBonusRouletteResult = () => {
        if (pendingBalance.value !== null) {
            balance.value = pendingBalance.value
            pendingBalance.value = null
        }

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
            pendingBalance.value = null
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

    const stopAutoSpin = () => {
        isAutoSpinning.value = false
    }

    const spin = async () => {
        const currentBet = bet.value
        if (isSpinning.value || (!hasFreeSpinAvailable() && balance.value < currentBet)) {
            return
        }

        isSpinning.value = true

        try {
            if (!hasFreeSpinAvailable()) {
                balance.value = roundMoney(balance.value - currentBet)
            }

            const scenario = await api.spin({ bet: currentBet })

            pendingBalance.value = scenario.balance

            await applyScenarioAnimations(scenario)

            if (scenario.bonusTriggered) {
                await sleep(BONUS_PROGRESS_FULL_PAUSE_MS)
                bonusProgress.value = 0
                stopAutoSpin()
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
                if (pendingBalance.value !== null) {
                    balance.value = pendingBalance.value
                    pendingBalance.value = null
                }
            }
        } finally {
            resetAnimationMeta()
            phase.value = 'idle'
            isSpinning.value = false
        }
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
        prepareBonusRouletteResult,
        applyBonusRouletteResult,
        clearBonusRouletteResult,
        initBoard,
        spin,
        startAutoSpin,
        stopAutoSpin
    }
}

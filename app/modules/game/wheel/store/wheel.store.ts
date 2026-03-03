import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { ActiveBonusEffect, AnimationMeta, BonusRouletteResult, CellValue, GamePhase } from '../types'
import { DEFAULT_BET, START_BALANCE } from '../constants'

export const useWheelStore = defineStore('wheel', () => {
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

    const setBet = (value: number) => {
        bet.value = value
    }

    const resetState = () => {
        board.value = []
        isSpinning.value = false
        isInitializing.value = false
        isAutoSpinning.value = false
        lastWinAmount.value = 0
        balance.value = START_BALANCE
        bet.value = DEFAULT_BET
        bonusProgress.value = 0
        bonusIntroTrigger.value = 0
        isBonusMode.value = false
        isBonusAnimationPlaying.value = false
        bonusRouletteResult.value = null
        activeBonusEffect.value = null
        pendingBonusEffect.value = null
        pendingCashWin.value = 0
        phase.value = 'idle'
        animationMeta.value = { removingIndices: [], spawnIndices: [], fallOffsetsByIndex: {}, rewardAnimations: [] }
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
        pendingBonusEffect,
        pendingCashWin,
        phase,
        animationMeta,
        setBet,
        resetState
    }
})

import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { ActiveBonusEffect, AnimationMeta, BonusRouletteResult, CellValue, GamePhase, WinResult } from '../types'

import { DEFAULT_BET, START_BALANCE } from '../constants'
import {
    useActiveBonus,
    useAnimationTimings,
    useBonusRoulette,
    useBoardFactory,
    useBoardGravity,
    useRewardAnimation,
    useSpinBoardAnimation,
    useWinningChains
} from '../composables'

const createEmptyAnimationMeta = (): AnimationMeta => ({
    removingIndices: [],
    spawnIndices: [],
    fallOffsetsByIndex: {},
    rewardAnimations: []
})

export const useWheelStore = defineStore('wheel', () => {
    const board = ref<CellValue[]>([])
    const isSpinning = ref<boolean>(false)
    const isAutoSpinning = ref<boolean>(false)
    const lastWins = ref<WinResult[]>([])
    const lastWinAmount = ref<number>(0)
    const balance = ref<number>(START_BALANCE)
    const bet = ref<number>(DEFAULT_BET)
    const bonusProgress = ref<number>(0)
    const bonusIntroTrigger = ref<number>(0)
    const isBonusMode = ref<boolean>(false)
    const isBonusAnimationPlaying = ref<boolean>(false)
    const bonusRouletteResult = ref<BonusRouletteResult | null>(null)
    const activeBonusEffect = ref<ActiveBonusEffect | null>(null)
    const phase = ref<GamePhase>('idle')
    const animationMeta = ref<AnimationMeta>(createEmptyAnimationMeta())

    const { sleep, getSpinOutTotalDuration, getSpawnTotalDuration } = useAnimationTimings()
    const { createBoard, refillEmptyWithMeta } = useBoardFactory()
    const { applyGravity } = useBoardGravity()
    const { triggerRewardAnimation } = useRewardAnimation({ animationMeta, sleep })
    const resetAnimationMeta = () => {
        animationMeta.value = createEmptyAnimationMeta()
    }

    const { hasFreeSpinAvailable, consumeActiveBonusSpin, getWinRewardMultiplier } = useActiveBonus({
        activeBonusEffect
    })

    const { prepareBonusRouletteResult, applyBonusRouletteResult, clearBonusRouletteResult } = useBonusRoulette({
        bet,
        bonusRouletteResult,
        activeBonusEffect
    })

    const { applyGravityAndRefillWithAnimation, prepareSpinBoardWithAnimation } = useSpinBoardAnimation({
        board,
        animationMeta,
        phase,
        isSpinning,
        lastWins,
        lastWinAmount,
        sleep,
        getSpinOutTotalDuration,
        getSpawnTotalDuration,
        createBoard,
        refillEmptyWithMeta,
        applyGravity,
        resetAnimationMeta
    })

    const initBoard = () => {
        board.value = createBoard({ avoidWin: true })
        lastWins.value = []
        lastWinAmount.value = 0
        balance.value = START_BALANCE
        bet.value = DEFAULT_BET
        bonusProgress.value = 0
        bonusIntroTrigger.value = 0
        isBonusMode.value = false
        isBonusAnimationPlaying.value = false
        bonusRouletteResult.value = null
        activeBonusEffect.value = null
        phase.value = 'idle'
        resetAnimationMeta()
        isSpinning.value = false
        isAutoSpinning.value = false
    }

    const { processWinningChains } = useWinningChains({
        board,
        animationMeta,
        phase,
        bonusProgress,
        lastWinAmount,
        getWinRewardMultiplier,
        sleep,
        triggerRewardAnimation,
        applyGravityAndRefillWithAnimation,
        onBonusGameTriggered: () => {
            stopAutoSpin()
            isBonusMode.value = true
            bonusIntroTrigger.value += 1
        }
    })

    // Основной метод спина: запускает анимации и сохраняет результаты выигрышей
    const spin = async () => {
        const currentBet = bet.value
        const isFreeSpin = hasFreeSpinAvailable()
        if (isSpinning.value || (!isFreeSpin && balance.value < currentBet)) {
            return
        }

        if (!isFreeSpin) {
            balance.value -= currentBet
        }
        const preparedBoard = await prepareSpinBoardWithAnimation()
        const { wins } = await processWinningChains(preparedBoard)

        lastWins.value = wins
        resetAnimationMeta()
        phase.value = 'idle'
        isSpinning.value = false
        consumeActiveBonusSpin()
    }

    function stopAutoSpin() {
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
        isAutoSpinning,
        lastWins,
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

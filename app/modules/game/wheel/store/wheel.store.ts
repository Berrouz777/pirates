import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { AnimationMeta, CellValue, GamePhase, WinResult } from '../types'

import { BOARD_SIZE, DEFAULT_BET, FALL_DURATION_MS, START_BALANCE } from '../constants'
import { useAnimationTimings, useBoardFactory, useBoardGravity, useRewardAnimation, useWinningChains } from '../composables'

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
    const phase = ref<GamePhase>('idle')
    const animationMeta = ref<AnimationMeta>(createEmptyAnimationMeta())

    const { sleep, getSpinOutTotalDuration, getSpawnTotalDuration } = useAnimationTimings()
    const { createBoard, refillEmptyWithMeta } = useBoardFactory()
    const { applyGravity } = useBoardGravity()
    const { triggerRewardAnimation } = useRewardAnimation({ animationMeta, sleep })

    const resetAnimationMeta = () => {
        animationMeta.value = createEmptyAnimationMeta()
    }

    const initBoard = () => {
        board.value = createBoard({ avoidWin: true })
        lastWins.value = []
        lastWinAmount.value = 0
        balance.value = START_BALANCE
        bet.value = DEFAULT_BET
        bonusProgress.value = 0
        phase.value = 'idle'
        resetAnimationMeta()
        isSpinning.value = false
        isAutoSpinning.value = false
    }

    // Применяем "гравитацию" к полю и заполняем пустые ячейки новыми элементами с анимацией
    const applyGravityAndRefillWithAnimation = async (currentBoard: CellValue[]) => {
        const gravityResult = applyGravity(currentBoard)
        board.value = gravityResult.board
        animationMeta.value = {
            removingIndices: [],
            spawnIndices: [],
            fallOffsetsByIndex: gravityResult.fallOffsetsByIndex,
            rewardAnimations: animationMeta.value.rewardAnimations
        }
        phase.value = 'falling'
        await sleep(FALL_DURATION_MS)

        const refillResult = refillEmptyWithMeta(gravityResult.board)
        board.value = refillResult.board
        animationMeta.value = {
            removingIndices: [],
            spawnIndices: refillResult.spawnIndices,
            fallOffsetsByIndex: {},
            rewardAnimations: animationMeta.value.rewardAnimations
        }
        phase.value = 'filling'
        await sleep(getSpawnTotalDuration(refillResult.spawnIndices))

        return [...board.value]
    }

    // Подготавливаем новую доску для спина: анимация вылета текущих элементов и появления новых
    const prepareSpinBoardWithAnimation = async () => {
        isSpinning.value = true
        lastWins.value = []
        lastWinAmount.value = 0
        resetAnimationMeta()
        phase.value = 'spinningOut'
        await sleep(getSpinOutTotalDuration())

        board.value = createBoard({ avoidWin: false })
        phase.value = 'spawning'
        animationMeta.value = {
            removingIndices: [],
            spawnIndices: Array.from({ length: BOARD_SIZE }, (_, index) => index),
            fallOffsetsByIndex: {},
            rewardAnimations: []
        }
        await sleep(getSpawnTotalDuration(animationMeta.value.spawnIndices))

        return [...board.value]
    }

    const { processWinningChains } = useWinningChains({
        board,
        animationMeta,
        phase,
        bonusProgress,
        lastWinAmount,
        sleep,
        triggerRewardAnimation,
        applyGravityAndRefillWithAnimation,
        onBonusGameTriggered: () => {
            stopAutoSpin()
        }
    })

    // Основной метод спина: запускает анимации и сохраняет результаты выигрышей
    const spin = async () => {
        const currentBet = bet.value
        if (isSpinning.value || balance.value < currentBet) {
            return
        }

        balance.value -= currentBet
        const preparedBoard = await prepareSpinBoardWithAnimation()
        const { wins } = await processWinningChains(preparedBoard)

        lastWins.value = wins
        resetAnimationMeta()
        phase.value = 'idle'
        isSpinning.value = false
    }

    function stopAutoSpin() {
        isAutoSpinning.value = false
    }

    const startAutoSpin = async () => {
        if (isAutoSpinning.value || isSpinning.value || balance.value < bet.value) {
            return
        }

        isAutoSpinning.value = true

        while (isAutoSpinning.value && balance.value >= bet.value) {
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
        phase,
        animationMeta,
        initBoard,
        spin,
        startAutoSpin,
        stopAutoSpin
    }
})

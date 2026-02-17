import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { AnimationMeta, CellValue, GamePhase, WinResult } from '../types'

import { BOARD_SIZE, CLEAR_DURATION_MS, FALL_DURATION_MS, getRewardOverlapMs, SPIN_COST, START_BALANCE, WIN_REWARD } from '../constants'
import { useAnimationTimings, useBoardFactory, useBoardGravity, useRewardAnimation, useWinResolver } from '../composables'

const createEmptyAnimationMeta = (): AnimationMeta => ({
    removingIndices: [],
    spawnIndices: [],
    fallOffsetsByIndex: {},
    rewardAnimations: []
})

export const useWheelStore = defineStore('wheel', () => {
    const board = ref<CellValue[]>([])
    const isSpinning = ref<boolean>(false)
    const lastWins = ref<WinResult[]>([])
    const lastWinAmount = ref<number>(0)
    const balance = ref<number>(START_BALANCE)
    const phase = ref<GamePhase>('idle')
    const animationMeta = ref<AnimationMeta>(createEmptyAnimationMeta())

    const { sleep, getSpinOutTotalDuration, getSpawnTotalDuration } = useAnimationTimings()
    const { createBoard, refillEmptyWithMeta } = useBoardFactory()
    const { applyGravity } = useBoardGravity()
    const { triggerRewardAnimation } = useRewardAnimation({ animationMeta, sleep })
    const { countByType, findWinningTypes, removeType, getRemovingIndicesByType } = useWinResolver()

    const resetAnimationMeta = () => {
        animationMeta.value = createEmptyAnimationMeta()
    }

    const initBoard = () => {
        board.value = createBoard({ avoidWin: true })
        lastWins.value = []
        lastWinAmount.value = 0
        balance.value = START_BALANCE
        phase.value = 'idle'
        resetAnimationMeta()
        isSpinning.value = false
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

    // Обрабатываем все последовательные выигрыши, пока есть выигрышные комбинации
    const processWinningChains = async (initialBoard: CellValue[]) => {
        const wins: WinResult[] = []
        let currentBoard = [...initialBoard]

        while (true) {
            const counts = countByType(currentBoard)
            const winningTypes = findWinningTypes(counts)

            if (winningTypes.length === 0) {
                break
            }

            wins.push(...winningTypes.map((type) => ({ type, count: counts[type] })))

            for (const type of winningTypes) {
                const removingIndices = getRemovingIndicesByType(currentBoard, type)

                if (removingIndices.length === 0) {
                    continue
                }

                triggerRewardAnimation()

                animationMeta.value = {
                    removingIndices,
                    spawnIndices: [],
                    fallOffsetsByIndex: {},
                    rewardAnimations: animationMeta.value.rewardAnimations
                }
                phase.value = 'clearing'
                const rewardOverlapMs = getRewardOverlapMs()
                await sleep(Math.max(CLEAR_DURATION_MS, rewardOverlapMs))
                lastWinAmount.value += WIN_REWARD

                currentBoard = removeType(currentBoard, type)
                board.value = currentBoard
            }

            currentBoard = await applyGravityAndRefillWithAnimation(currentBoard)
        }

        return { wins }
    }

    // Основной метод спина: запускает анимации и сохраняет результаты выигрышей
    const spin = async () => {
        if (isSpinning.value || balance.value < SPIN_COST) {
            return
        }

        balance.value -= SPIN_COST
        const preparedBoard = await prepareSpinBoardWithAnimation()
        const { wins } = await processWinningChains(preparedBoard)

        lastWins.value = wins
        resetAnimationMeta()
        phase.value = 'idle'
        isSpinning.value = false
    }

    return {
        board,
        isSpinning,
        lastWins,
        lastWinAmount,
        balance,
        phase,
        animationMeta,
        initBoard,
        spin
    }
})

import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { AnimationMeta, CellValue, GamePhase, WinResult } from '../types/game-field.types'

import {
    BOARD_SIZE,
    CLEAR_DURATION_MS,
    FALL_DURATION_MS,
    GRID_SIZE,
    SPAWN_DURATION_MS,
    SPAWN_STEP_MS,
    SPIN_OUT_DURATION_MS,
    SPIN_OUT_STEP_MS
} from '../constants/game-field.constants'
import { applyGravity, countByType, createBoard, findWinningTypes, refillEmptyWithMeta, removeType } from '../utils/game-field.utils'

export const useGameFieldStore = defineStore('game-field', () => {
    // State
    const board = ref<CellValue[]>([])
    const isSpinning = ref<boolean>(false)
    const lastWins = ref<WinResult[]>([])
    const phase = ref<GamePhase>('idle')
    const animationMeta = ref<AnimationMeta>({
        removingIndices: [],
        spawnIndices: [],
        fallOffsetsByIndex: {}
    })

    const sleep = (duration: number) => new Promise<void>((resolve) => setTimeout(resolve, duration))
    const getRow = (index: number) => Math.floor(index / GRID_SIZE)
    const getColumn = (index: number) => index % GRID_SIZE
    const getSpawnOrder = (index: number) => getColumn(index) * GRID_SIZE + getRow(index)
    const getSpinOutTotalDuration = () => SPIN_OUT_DURATION_MS + SPIN_OUT_STEP_MS * (BOARD_SIZE - 1)
    const getSpawnTotalDuration = (indices: number[]) => {
        if (indices.length === 0) {
            return SPAWN_DURATION_MS
        }

        const maxOrder = indices.reduce((maxValue, index) => Math.max(maxValue, getSpawnOrder(index)), 0)
        return SPAWN_DURATION_MS + SPAWN_STEP_MS * maxOrder
    }

    const resetAnimationMeta = () => {
        animationMeta.value = {
            removingIndices: [],
            spawnIndices: [],
            fallOffsetsByIndex: {}
        }
    }

    // Methods
    // Инициализация стартового поля без выигрышных комбинаций
    const initBoard = () => {
        board.value = createBoard({ avoidWin: true })
        lastWins.value = []
        phase.value = 'idle'
        resetAnimationMeta()
        isSpinning.value = false
    }

    // Получаем индексы всех ячеек с указанным типом
    const getRemovingIndicesByType = (currentBoard: CellValue[], type: CellValue) =>
        currentBoard.reduce<number[]>((indices, cell, index) => {
            if (cell === type) {
                indices.push(index)
            }

            return indices
        }, [])

    // Применяем "гравитацию" к полю и заполняем пустые ячейки новыми элементами с анимацией
    const applyGravityAndRefillWithAnimation = async (currentBoard: CellValue[]) => {
        const gravityResult = applyGravity(currentBoard)
        board.value = gravityResult.board
        animationMeta.value = {
            removingIndices: [],
            spawnIndices: [],
            fallOffsetsByIndex: gravityResult.fallOffsetsByIndex
        }
        phase.value = 'falling'
        await sleep(FALL_DURATION_MS)

        const refillResult = refillEmptyWithMeta(gravityResult.board)
        board.value = refillResult.board
        animationMeta.value = {
            removingIndices: [],
            spawnIndices: refillResult.spawnIndices,
            fallOffsetsByIndex: {}
        }
        phase.value = 'filling'
        await sleep(getSpawnTotalDuration(refillResult.spawnIndices))

        return [...board.value]
    }

    // Подготавливаем новую доску для спина: анимация вылета текущих элементов и появления новых
    const prepareSpinBoardWithAnimation = async () => {
        isSpinning.value = true
        lastWins.value = []
        resetAnimationMeta()
        phase.value = 'spinningOut'
        await sleep(getSpinOutTotalDuration())

        board.value = createBoard({ avoidWin: false })
        phase.value = 'spawning'
        animationMeta.value = {
            removingIndices: [],
            spawnIndices: Array.from({ length: BOARD_SIZE }, (_, index) => index),
            fallOffsetsByIndex: {}
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

                animationMeta.value = {
                    removingIndices,
                    spawnIndices: [],
                    fallOffsetsByIndex: {}
                }
                phase.value = 'clearing'
                await sleep(CLEAR_DURATION_MS)

                currentBoard = removeType(currentBoard, type)
                board.value = currentBoard
            }

            currentBoard = await applyGravityAndRefillWithAnimation(currentBoard)
        }

        return { wins }
    }

    // Основной метод спина: запускает анимации и сохраняет результаты выигрышей
    const spin = async () => {
        if (isSpinning.value) {
            return
        }

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
        phase,
        animationMeta,
        initBoard,
        spin
    }
})

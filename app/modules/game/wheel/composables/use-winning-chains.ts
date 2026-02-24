import type { Ref } from 'vue'
import type { AnimationMeta, CellValue, ElementType, GamePhase, WinResult } from '../types'

import { BONUS_PROGRESS_MAX, CLEAR_DURATION_MS, getRewardOverlapMs, WIN_REWARD } from '../constants'

import { useWinResolver } from './use-win-resolver'

export interface UseWinningChainsOptions {
    board: Ref<CellValue[]>
    animationMeta: Ref<AnimationMeta>
    phase: Ref<GamePhase>
    bonusProgress: Ref<number>
    lastWinAmount: Ref<number>
    sleep: (durationMs: number) => Promise<void>
    triggerRewardAnimation: () => void
    applyGravityAndRefillWithAnimation: (currentBoard: CellValue[]) => Promise<CellValue[]>
    onBonusGameTriggered?: () => void
}

export const useWinningChains = ({
    board,
    animationMeta,
    phase,
    bonusProgress,
    lastWinAmount,
    sleep,
    triggerRewardAnimation,
    applyGravityAndRefillWithAnimation,
    onBonusGameTriggered
}: UseWinningChainsOptions) => {
    const { countByType, findWinningTypes, removeType, getRemovingIndicesByType } = useWinResolver()

    // Единообразно переводим поле в фазу очистки и передаем индексы ячеек для анимации взрыва.
    const setClearingState = (removingIndices: number[]) => {
        animationMeta.value = {
            removingIndices,
            spawnIndices: [],
            fallOffsetsByIndex: {},
            rewardAnimations: animationMeta.value.rewardAnimations
        }
        phase.value = 'clearing'
    }

    const updateBonusProgress = (bonusGameCount: number) => {
        if (bonusGameCount <= 0) {
            return
        }

        bonusProgress.value += bonusGameCount
        if (bonusProgress.value >= BONUS_PROGRESS_MAX) {
            onBonusGameTriggered?.()
            bonusProgress.value = 0
        }
    }

    // Обработка кейса без выигрышных групп: удаляем только бонус гейм
    const clearOnlyBonusGame = async (currentBoard: CellValue[]) => {
        const bonusRemovingIndices = getRemovingIndicesByType(currentBoard, 'bonus-game')
        setClearingState(bonusRemovingIndices)
        await sleep(CLEAR_DURATION_MS)

        const nextBoard = removeType(currentBoard, 'bonus-game')
        board.value = nextBoard

        return applyGravityAndRefillWithAnimation(nextBoard)
    }

    // Последовательно очищаем выигрышные типы (по одному),
    // а бонус гейм подмешиваем к первой очищаемой группе, если он есть на поле.
    const clearWinningTypesWithBonus = async (currentBoard: CellValue[], winningTypes: ElementType[], hasBonusGame: boolean) => {
        let nextBoard = currentBoard
        let isBonusRemoved = false

        for (let index = 0; index < winningTypes.length; index += 1) {
            const type = winningTypes[index]!
            const typeRemovingIndices = getRemovingIndicesByType(nextBoard, type)
            const shouldRemoveBonusWithCurrentGroup = hasBonusGame && !isBonusRemoved && index === 0
            const bonusRemovingIndices = shouldRemoveBonusWithCurrentGroup ? getRemovingIndicesByType(nextBoard, 'bonus-game') : []

            const removingIndices = Array.from(new Set([...typeRemovingIndices, ...bonusRemovingIndices]))
            if (removingIndices.length === 0) {
                continue
            }

            triggerRewardAnimation()
            setClearingState(removingIndices)
            const rewardOverlapMs = getRewardOverlapMs()
            await sleep(Math.max(CLEAR_DURATION_MS, rewardOverlapMs))
            lastWinAmount.value += WIN_REWARD

            nextBoard = removeType(nextBoard, type)
            if (bonusRemovingIndices.length > 0) {
                nextBoard = removeType(nextBoard, 'bonus-game')
                isBonusRemoved = true
            }

            board.value = nextBoard
        }

        return applyGravityAndRefillWithAnimation(nextBoard)
    }

    // Главный цикл обработки цепочек:
    // считаем победы/бонусы, очищаем поле и запускаем каскад,
    // пока на поле остаются выигрышные комбинации или бонус гейм элементы.
    const processWinningChains = async (initialBoard: CellValue[]) => {
        const wins: WinResult[] = []
        let currentBoard = [...initialBoard]

        while (true) {
            const counts = countByType(currentBoard)
            const winningTypes = findWinningTypes(counts)
            const bonusGameCount = counts['bonus-game']
            const hasBonusGame = bonusGameCount > 0

            updateBonusProgress(bonusGameCount)

            if (winningTypes.length === 0 && !hasBonusGame) {
                break
            }

            wins.push(...winningTypes.map((type) => ({ type, count: counts[type] })))

            if (winningTypes.length === 0) {
                currentBoard = await clearOnlyBonusGame(currentBoard)
                continue
            }

            currentBoard = await clearWinningTypesWithBonus(currentBoard, winningTypes, hasBonusGame)
        }

        return { wins }
    }

    return { processWinningChains }
}

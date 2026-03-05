import type { Ref } from 'vue'

import type { AnimationMeta, CellValue, GamePhase, SpinDrop, SpinScenarioResponse } from '../types'
import {
    BOARD_SIZE,
    BONUS_FLIGHT_DURATION_MS,
    BONUS_FLIGHT_STEP_MS,
    CLEAR_DURATION_MS,
    FALL_DURATION_MS,
    REWARD_FLY_START_DELAY_MS,
    getRewardOverlapMs
} from '../constants'
import { useAnimationTimings } from './use-animation-timings'
import { useBoardGravity } from './use-board-gravity'
import { useBoardUtils } from './use-board-utils'
import { useRewardAnimation } from './use-reward-animation'

interface UseSpinScenarioOptions {
    board: Ref<CellValue[]>
    phase: Ref<GamePhase>
    animationMeta: Ref<AnimationMeta>
    lastWinAmount: Ref<number>
    onDropProgress?: (bonusProgress: number) => void
}

const createEmptyAnimationMeta = (): AnimationMeta => ({
    removingIndices: [],
    spawnIndices: [],
    fallOffsetsByIndex: {},
    rewardAnimations: [],
    bonusHoverIndices: [],
    hiddenBonusIndices: [],
    bonusFlightAnimations: []
})

export const useSpinScenario = ({ board, phase, animationMeta, lastWinAmount, onDropProgress }: UseSpinScenarioOptions) => {
    const { sleep, getSpinOutTotalDuration, getSpawnTotalDuration } = useAnimationTimings()
    const { applyGravity } = useBoardGravity()
    const { buildBoardFromCounts, getNullIndices, findGroupIndices, findBonusGameIndices } = useBoardUtils()
    const { triggerRewardAnimation } = useRewardAnimation({ animationMeta, sleep })
    let bonusFlightId = 0
    const BONUS_FLIGHT_SNAPSHOT_GUARD_MS = 24

    const resetAnimationMeta = () => {
        animationMeta.value = createEmptyAnimationMeta()
    }

    const triggerBonusFlights = (bonusIndices: number[]) => {
        if (bonusIndices.length === 0) {
            return
        }

        const uniqueBonusIndices = Array.from(new Set(bonusIndices))
        const bonusFlightAnimations = uniqueBonusIndices.map((sourceIndex, order) => ({
            id: bonusFlightId++,
            sourceIndex,
            startDelayMs: order * BONUS_FLIGHT_STEP_MS
        }))

        animationMeta.value = {
            ...animationMeta.value,
            hiddenBonusIndices: uniqueBonusIndices,
            bonusFlightAnimations
        }
    }

    const spawnInitialBoard = async (firstDrop: SpinDrop) => {
        board.value = buildBoardFromCounts(Array(BOARD_SIZE).fill(null), firstDrop.counts)
        animationMeta.value = {
            ...createEmptyAnimationMeta(),
            spawnIndices: Array.from({ length: BOARD_SIZE }, (_, i) => i)
        }
        phase.value = 'spawning'
        await sleep(getSpawnTotalDuration(animationMeta.value.spawnIndices))
    }

    const explodeGroup = async (groupType: SpinDrop['explodingGroups'][number]['type'], groupCount: number, includeBonusIndices: boolean) => {
        const removingIndices = findGroupIndices(board.value, groupType, groupCount)
        const bonusIndices = includeBonusIndices ? findBonusGameIndices(board.value) : []
        const allRemoving = Array.from(new Set([...removingIndices, ...bonusIndices]))

        animationMeta.value = {
            ...animationMeta.value,
            removingIndices: allRemoving,
            spawnIndices: [],
            fallOffsetsByIndex: {},
            bonusHoverIndices: bonusIndices,
            hiddenBonusIndices: [],
            bonusFlightAnimations: []
        }
        phase.value = 'clearing'

        triggerRewardAnimation({
            onFlyingStart: () => {
                triggerBonusFlights(bonusIndices)
            }
        })

        const hasBonuses = bonusIndices.length > 0
        const lastBonusStartOffset = hasBonuses ? (bonusIndices.length - 1) * BONUS_FLIGHT_STEP_MS : 0
        const totalBonusFlightTime = hasBonuses ? BONUS_FLIGHT_DURATION_MS + lastBonusStartOffset : 0
        const clearDelay = hasBonuses ? REWARD_FLY_START_DELAY_MS + totalBonusFlightTime + BONUS_FLIGHT_SNAPSHOT_GUARD_MS : getRewardOverlapMs()
        await sleep(Math.max(CLEAR_DURATION_MS, clearDelay))

        const removingSet = new Set(allRemoving)
        board.value = board.value.map((cell, i) => (removingSet.has(i) ? null : cell))

        // После полного завершения полётов бонусов очищаем бонусные метаданные,
        // чтобы не подсвечивать/не прятать уже удалённые ячейки и убрать overlay.
        animationMeta.value = {
            ...animationMeta.value,
            bonusHoverIndices: [],
            hiddenBonusIndices: [],
            bonusFlightAnimations: []
        }

        return allRemoving
    }

    const explodeBonusOnly = async () => {
        const bonusOnly = findBonusGameIndices(board.value)
        if (bonusOnly.length === 0) return []

        animationMeta.value = {
            ...animationMeta.value,
            removingIndices: bonusOnly,
            spawnIndices: [],
            fallOffsetsByIndex: {},
            bonusHoverIndices: bonusOnly,
            hiddenBonusIndices: [],
            bonusFlightAnimations: []
        }
        phase.value = 'clearing'
        await sleep(CLEAR_DURATION_MS)

        const bonusSet = new Set(bonusOnly)
        board.value = board.value.map((cell, i) => (bonusSet.has(i) ? null : cell))
        animationMeta.value = {
            ...animationMeta.value,
            bonusHoverIndices: [],
            hiddenBonusIndices: [],
            bonusFlightAnimations: []
        }

        return bonusOnly
    }

    const applyFall = async () => {
        const { board: boardAfterFall, fallOffsetsByIndex } = applyGravity(board.value)
        animationMeta.value = {
            ...animationMeta.value,
            removingIndices: [],
            spawnIndices: [],
            fallOffsetsByIndex
        }
        phase.value = 'falling'
        board.value = [...boardAfterFall]
        await sleep(FALL_DURATION_MS)
    }

    const fillEmpty = async (nextDrop: SpinDrop) => {
        const emptyIndices = getNullIndices(board.value)
        if (emptyIndices.length === 0) return

        board.value = buildBoardFromCounts(board.value, nextDrop.counts, emptyIndices)
        animationMeta.value = {
            ...animationMeta.value,
            removingIndices: [],
            spawnIndices: emptyIndices,
            fallOffsetsByIndex: {}
        }
        phase.value = 'filling'
        await sleep(getSpawnTotalDuration(emptyIndices))
    }

    const processDrop = async (drop: SpinDrop, nextDrop: SpinDrop | undefined) => {
        let allRemovingForDrop: number[] = []

        for (const [groupIndex, group] of drop.explodingGroups.entries()) {
            const isFirstGroup = groupIndex === 0
            const allRemoving = await explodeGroup(group.type, group.count, isFirstGroup)
            allRemovingForDrop = Array.from(new Set([...allRemovingForDrop, ...allRemoving]))

            lastWinAmount.value = Math.round((lastWinAmount.value + group.rewardAmount) * 100) / 100
        }

        if (allRemovingForDrop.length === 0) {
            const bonusRemoving = await explodeBonusOnly()
            if (bonusRemoving.length === 0) return
        }

        await applyFall()

        if (nextDrop) {
            await fillEmpty(nextDrop)
        }

        onDropProgress?.(drop.bonusProgress)
    }

    const applyScenarioAnimations = async (scenario: SpinScenarioResponse) => {
        lastWinAmount.value = 0
        resetAnimationMeta()
        phase.value = 'spinningOut'
        await sleep(getSpinOutTotalDuration())

        const firstDrop = scenario.drops[0]
        if (!firstDrop) return

        await spawnInitialBoard(firstDrop)

        for (let dropIndex = 0; dropIndex < scenario.drops.length; dropIndex++) {
            const drop = scenario.drops[dropIndex]!
            const nextDrop = scenario.drops[dropIndex + 1]
            await processDrop(drop, nextDrop)
        }
    }

    return {
        applyScenarioAnimations,
        resetAnimationMeta,
        createEmptyAnimationMeta
    }
}

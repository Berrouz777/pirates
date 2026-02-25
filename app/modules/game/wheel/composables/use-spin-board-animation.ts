import type { Ref } from 'vue'
import type { AnimationMeta, CellValue, GamePhase, WinResult } from '../types'
import { BOARD_SIZE, FALL_DURATION_MS } from '../constants'

interface GravityResult {
    board: CellValue[]
    fallOffsetsByIndex: Record<number, number>
}

interface RefillResult {
    board: CellValue[]
    spawnIndices: number[]
}

interface UseSpinBoardAnimationOptions {
    board: Ref<CellValue[]>
    animationMeta: Ref<AnimationMeta>
    phase: Ref<GamePhase>
    isSpinning: Ref<boolean>
    lastWins: Ref<WinResult[]>
    lastWinAmount: Ref<number>
    sleep: (durationMs: number) => Promise<void>
    getSpinOutTotalDuration: () => number
    getSpawnTotalDuration: (spawnIndices: number[]) => number
    createBoard: (options: { avoidWin: boolean }) => CellValue[]
    refillEmptyWithMeta: (board: CellValue[]) => RefillResult
    applyGravity: (board: CellValue[]) => GravityResult
    resetAnimationMeta: () => void
}

export const useSpinBoardAnimation = ({
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
}: UseSpinBoardAnimationOptions) => {
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

    return {
        applyGravityAndRefillWithAnimation,
        prepareSpinBoardWithAnimation
    }
}

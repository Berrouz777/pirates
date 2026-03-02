import type { CellValue, ElementType, SpinDrop } from '../types'

import { BOARD_SIZE } from '../constants'

const shuffleArray = <T>(arr: T[]): T[] => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
    }
    return arr
}

const buildElementsFromCounts = (counts: SpinDrop['counts']): Exclude<CellValue, null>[] => {
    const elements: Exclude<CellValue, null>[] = []
    for (const [type, count] of Object.entries(counts)) {
        for (let i = 0; i < (count ?? 0); i++) {
            elements.push(type as Exclude<CellValue, null>)
        }
    }
    return shuffleArray(elements)
}

export const useBoardUtils = () => {
    const buildBoardFromCounts = (currentBoard: CellValue[], counts: SpinDrop['counts'], targetIndices?: number[]): CellValue[] => {
        const elements = buildElementsFromCounts(counts)
        const nextBoard = [...currentBoard]
        const indices = targetIndices ?? Array.from({ length: BOARD_SIZE }, (_, i) => i)

        indices.forEach((idx, i) => {
            nextBoard[idx] = elements[i] ?? null
        })

        return nextBoard
    }

    const getNullIndices = (board: CellValue[]): number[] =>
        board.reduce<number[]>((acc, cell, i) => {
            if (cell === null) acc.push(i)
            return acc
        }, [])

    const findGroupIndices = (board: CellValue[], type: ElementType, count: number): number[] => {
        const found: number[] = []
        for (let i = 0; i < board.length && found.length < count; i++) {
            if (board[i] === type) found.push(i)
        }
        return found
    }

    const findBonusGameIndices = (board: CellValue[]): number[] =>
        board.reduce<number[]>((acc, cell, i) => {
            if (cell === 'bonus-game') acc.push(i)
            return acc
        }, [])

    return {
        buildBoardFromCounts,
        getNullIndices,
        findGroupIndices,
        findBonusGameIndices
    }
}

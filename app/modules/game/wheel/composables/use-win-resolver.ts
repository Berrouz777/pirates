import type { CellValue, ElementType } from '../types'

import { ELEMENT_TYPES, WIN_THRESHOLD } from '../constants'

export const useWinResolver = () => {
    const countByType = (board: CellValue[]): Record<ElementType, number> => {
        const counts = ELEMENT_TYPES.reduce<Record<ElementType, number>>(
            (accumulator, type) => {
                accumulator[type] = 0
                return accumulator
            },
            {} as Record<ElementType, number>
        )

        for (const cell of board) {
            if (!cell) {
                continue
            }

            counts[cell] += 1
        }

        return counts
    }

    const findWinningTypes = (counts: Record<ElementType, number>): ElementType[] => {
        return ELEMENT_TYPES.filter((type) => counts[type] >= WIN_THRESHOLD)
    }

    const removeType = (board: CellValue[], type: ElementType): CellValue[] => {
        return board.map((cell) => (cell === type ? null : cell))
    }

    const getRemovingIndicesByType = (board: CellValue[], type: ElementType): number[] => {
        return board.reduce<number[]>((indices, cell, index) => {
            if (cell === type) {
                indices.push(index)
            }

            return indices
        }, [])
    }

    return {
        countByType,
        findWinningTypes,
        removeType,
        getRemovingIndicesByType
    }
}

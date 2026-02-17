import type { CellValue } from '../types'

import { GRID_SIZE } from '../constants'

export interface GravityResult {
    board: CellValue[]
    fallOffsetsByIndex: Record<number, number>
}

const getColumnIndices = (columnIndex: number): number[] => {
    return Array.from({ length: GRID_SIZE }, (_, row) => row * GRID_SIZE + columnIndex)
}

export const useBoardGravity = () => {
    const applyGravity = (board: CellValue[]): GravityResult => {
        const nextBoard = [...board]
        const fallOffsetsByIndex: Record<number, number> = {}

        for (let columnIndex = 0; columnIndex < GRID_SIZE; columnIndex += 1) {
            const indices = getColumnIndices(columnIndex)
            const column = indices.map((index) => board[index])
            const nextColumn: CellValue[] = Array.from({ length: GRID_SIZE }, () => null)
            let writeRow = GRID_SIZE - 1

            for (let row = GRID_SIZE - 1; row >= 0; row -= 1) {
                const cell = column[row]

                if (!cell) {
                    continue
                }

                nextColumn[writeRow] = cell
                const offset = writeRow - row
                const targetIndex = indices[writeRow]

                if (offset > 0 && targetIndex !== undefined) {
                    fallOffsetsByIndex[targetIndex] = offset
                }

                writeRow -= 1
            }

            for (let row = 0; row < GRID_SIZE; row += 1) {
                const targetIndex = indices[row]

                if (targetIndex !== undefined) {
                    nextBoard[targetIndex] = nextColumn[row] ?? null
                }
            }
        }

        return { board: nextBoard, fallOffsetsByIndex }
    }

    return { applyGravity }
}

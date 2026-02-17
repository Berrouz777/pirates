import type { CreateBoardOptions, ElementType } from '../types'

import { BOARD_SIZE, ELEMENT_TYPES, WIN_THRESHOLD } from '../constants'

const getRandomElementType = (): ElementType => {
    const index = Math.floor(Math.random() * ELEMENT_TYPES.length)
    return ELEMENT_TYPES[index]!
}

const createRandomBoard = (size: number): ElementType[] => {
    return Array.from({ length: size }, () => getRandomElementType())
}

const createBoardWithoutWins = (size: number): ElementType[] => {
    const maxPerType = WIN_THRESHOLD - 1
    const remaining = ELEMENT_TYPES.reduce<Record<ElementType, number>>(
        (accumulator, type) => {
            accumulator[type] = maxPerType
            return accumulator
        },
        {} as Record<ElementType, number>
    )

    const board: ElementType[] = []

    for (let index = 0; index < size; index += 1) {
        const availableTypes = ELEMENT_TYPES.filter((type) => remaining[type] > 0)
        const nextType = availableTypes[Math.floor(Math.random() * availableTypes.length)]!
        remaining[nextType] -= 1
        board.push(nextType)
    }

    return board
}

export const useBoardFactory = () => {
    const createBoard = (options: CreateBoardOptions): ElementType[] => {
        if (options.avoidWin) {
            return createBoardWithoutWins(BOARD_SIZE)
        }

        return createRandomBoard(BOARD_SIZE)
    }

    const refillEmpty = (board: Array<ElementType | null>): ElementType[] => {
        return board.map((cell) => cell ?? getRandomElementType())
    }

    const refillEmptyWithMeta = (board: Array<ElementType | null>) => {
        const spawnIndices: number[] = []
        const nextBoard = board.map((cell, index) => {
            if (cell !== null) {
                return cell
            }

            spawnIndices.push(index)
            return getRandomElementType()
        })

        return { board: nextBoard, spawnIndices }
    }

    return {
        createBoard,
        refillEmpty,
        refillEmptyWithMeta
    }
}

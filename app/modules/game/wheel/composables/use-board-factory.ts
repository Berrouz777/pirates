import type { CreateBoardOptions, ElementType } from '../types'

import { BOARD_SIZE, BONUS_GAME_DROP_CHANCE, ELEMENT_TYPES, WIN_THRESHOLD } from '../constants'
const REGULAR_ELEMENT_TYPES = ELEMENT_TYPES.filter((type) => type !== 'bonus-game') as ElementType[]

const getRandomElementType = (): ElementType => {
    if (Math.random() < BONUS_GAME_DROP_CHANCE) {
        return 'bonus-game'
    }

    const index = Math.floor(Math.random() * REGULAR_ELEMENT_TYPES.length)
    return REGULAR_ELEMENT_TYPES[index]!
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
    remaining['bonus-game'] = 0

    const board: ElementType[] = []

    for (let index = 0; index < size; index += 1) {
        const availableTypes = REGULAR_ELEMENT_TYPES.filter((type) => remaining[type] > 0)
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

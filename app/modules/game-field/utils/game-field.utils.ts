import type { CreateBoardOptions, ElementType, ResolveWinsResult, WinResult } from '../types/game-field.types'

import { BOARD_SIZE, ELEMENT_TYPES, WIN_THRESHOLD } from '../constants/game-field.constants'

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

export const createBoard = (options: CreateBoardOptions): ElementType[] => {
    if (options.avoidWin) {
        return createBoardWithoutWins(BOARD_SIZE)
    }

    return createRandomBoard(BOARD_SIZE)
}

export const countByType = (board: ElementType[]): Record<ElementType, number> => {
    const counts = ELEMENT_TYPES.reduce<Record<ElementType, number>>(
        (accumulator, type) => {
            accumulator[type] = 0
            return accumulator
        },
        {} as Record<ElementType, number>
    )

    for (const cell of board) {
        counts[cell] += 1
    }

    return counts
}

export const findWinningTypes = (counts: Record<ElementType, number>): ElementType[] => {
    return ELEMENT_TYPES.filter((type) => counts[type] >= WIN_THRESHOLD)
}

export const removeType = (board: ElementType[], type: ElementType): Array<ElementType | null> => {
    return board.map((cell) => (cell === type ? null : cell))
}

export const refillEmpty = (board: Array<ElementType | null>): ElementType[] => {
    return board.map((cell) => (cell ? cell : getRandomElementType()))
}

export const resolveWins = (board: ElementType[]): ResolveWinsResult => {
    let currentBoard = [...board]
    const wins: WinResult[] = []

    while (true) {
        const winningTypes = findWinningTypes(countByType(currentBoard))

        if (winningTypes.length === 0) {
            break
        }

        for (const type of winningTypes) {
            const counts = countByType(currentBoard)

            if (counts[type] < WIN_THRESHOLD) {
                continue
            }

            wins.push({ type, count: counts[type] })
            currentBoard = refillEmpty(removeType(currentBoard, type))
        }
    }

    return { board: currentBoard, wins }
}

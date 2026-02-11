import type { CellValue, CreateBoardOptions, ElementType, ResolveWinsResult, WinResult } from '../types/game-field.types'

import { BOARD_SIZE, ELEMENT_TYPES, GRID_SIZE, WIN_THRESHOLD } from '../constants/game-field.constants'

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

export const countByType = (board: CellValue[]): Record<ElementType, number> => {
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

export const findWinningTypes = (counts: Record<ElementType, number>): ElementType[] => {
    return ELEMENT_TYPES.filter((type) => counts[type] >= WIN_THRESHOLD)
}

export const removeType = (board: CellValue[], type: ElementType): Array<ElementType | null> => {
    return board.map((cell) => (cell === type ? null : cell))
}

export const refillEmpty = (board: Array<CellValue>): ElementType[] => {
    return board.map((cell) => cell ?? getRandomElementType())
}

export interface GravityResult {
    board: CellValue[]
    fallOffsetsByIndex: Record<number, number>
}

export interface RemoveResult {
    board: CellValue[]
    removingIndices: number[]
}

export interface RefillResult {
    board: ElementType[]
    spawnIndices: number[]
}

const getColumnIndices = (columnIndex: number): number[] => {
    return Array.from({ length: GRID_SIZE }, (_, row) => row * GRID_SIZE + columnIndex)
}

// Удаляет с поля все элементы выигрышных типов и возвращает результат с индексами удаленных элементов
export const removeWinningTypes = (board: CellValue[], winningTypes: ElementType[]): RemoveResult => {
    const winningSet = new Set(winningTypes)
    const removingIndices: number[] = []
    const nextBoard = board.map((cell, index) => {
        if (cell && winningSet.has(cell)) {
            removingIndices.push(index)
            return null
        }

        return cell
    })

    return { board: nextBoard, removingIndices }
}

// Применяется гравитация к игравому полю и возвращаем новое поле + смещение для анимации падения
export const applyGravity = (board: CellValue[]): GravityResult => {
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

// Заполняются пустые ячейки новыми элементами и возвращаем индексы заполненных ячеек
export const refillEmptyWithMeta = (board: CellValue[]): RefillResult => {
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

/**
 * Автоматически разрешаем все выигрышные комбинации на поле
 * Циклом удаляем выигрышные элементы, применяем гравитацию и заполняем пустоты
 */
export const resolveWins = (board: ElementType[]): ResolveWinsResult => {
    let currentBoard = [...board]
    const wins: WinResult[] = []

    while (true) {
        const winningTypes = findWinningTypes(countByType(currentBoard))

        if (!winningTypes.length) {
            break
        }

        const counts = countByType(currentBoard)
        const winsForStep = winningTypes.map((type) => ({ type, count: counts[type] }))
        wins.push(...winsForStep)

        const removal = removeWinningTypes(currentBoard, winningTypes)
        const gravityResult = applyGravity(removal.board)
        currentBoard = refillEmpty(gravityResult.board)
    }

    return { board: currentBoard, wins }
}

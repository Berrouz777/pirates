import type { ElementType } from './element.types'

export type CellValue = ElementType | null

export interface BoardState {
    cells: CellValue[]
}

export interface CreateBoardOptions {
    avoidWin: boolean
}

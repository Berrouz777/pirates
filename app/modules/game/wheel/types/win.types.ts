import type { ElementType } from './element.types'

export interface WinResult {
    type: ElementType
    count: number
}

export interface ResolveWinsResult {
    board: ElementType[]
    wins: WinResult[]
}

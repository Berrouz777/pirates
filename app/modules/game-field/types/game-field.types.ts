export type ElementType = 'wheel' | 'bomb' | 'sword' | 'shield' | 'musketoon' | 'keg' | 'tankard' | 'cannon'

export type CellValue = ElementType | null

export type GamePhase = 'idle' | 'spinningOut' | 'spawning' | 'clearing' | 'falling' | 'filling'

export interface AnimationMeta {
    removingIndices: number[]
    spawnIndices: number[]
    fallOffsetsByIndex: Record<number, number>
}

export interface BoardState {
    cells: CellValue[]
}

export interface CreateBoardOptions {
    avoidWin: boolean
}

export interface WinResult {
    type: ElementType
    count: number
}

export interface ResolveWinsResult {
    board: ElementType[]
    wins: WinResult[]
}

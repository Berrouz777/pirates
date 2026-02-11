export type ElementType = 'wheel' | 'bomb' | 'sword' | 'shield' | 'musketoon' | 'keg' | 'tankard' | 'cannon'

export interface BoardState {
    cells: ElementType[]
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

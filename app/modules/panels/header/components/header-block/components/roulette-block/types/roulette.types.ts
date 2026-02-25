export interface RouletteCell {
    key: RouletteCellKey
    imageSrc?: string
}

export interface RouletteRenderCell extends RouletteCell {
    renderKey: string
    slotIndex: number
}

export type RouletteCellKey =
    | 'empty'
    | 'freespin-5'
    | 'multiple-15'
    | 'multiple-2'
    | 'multiple-5'
    | 'cash-10'
    | 'cash-25'
    | 'cash-50'
    | 'cash-100'
    | 'cash-500'
    | 'cash-1000'

export interface RouletteSpinResult {
    selectedCellIndex: number
    selectedSlotIndex: number
}

import type { ElementType } from '../types/game-field.types'

export const GRID_SIZE = 7
export const BOARD_SIZE = GRID_SIZE * GRID_SIZE
export const WIN_THRESHOLD = 13

export const ELEMENT_TYPES: ElementType[] = ['wheel', 'bomb', 'sword', 'shield', 'musketoon', 'keg', 'tankard', 'cannon']

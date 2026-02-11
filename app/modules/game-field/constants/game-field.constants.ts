import type { ElementType } from '../types/game-field.types'

export const GRID_SIZE = 7
export const BOARD_SIZE = GRID_SIZE * GRID_SIZE
export const WIN_THRESHOLD = 13

export const SPIN_OUT_DURATION_MS = 400
export const SPAWN_DURATION_MS = 400
export const CLEAR_DURATION_MS = 350
export const FALL_DURATION_MS = 400
export const FILL_DURATION_MS = 400

export const SPIN_OUT_STEP_MS = 8
export const SPAWN_STEP_MS = 8

export const ELEMENT_TYPES: ElementType[] = ['wheel', 'bomb', 'sword', 'shield', 'musketoon', 'keg', 'tankard', 'cannon']

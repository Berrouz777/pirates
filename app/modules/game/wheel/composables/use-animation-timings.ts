import { BOARD_SIZE, GRID_SIZE, SPAWN_DURATION_MS, SPAWN_STEP_MS, SPIN_OUT_DURATION_MS, SPIN_OUT_STEP_MS } from '../constants'

export const useAnimationTimings = () => {
    const sleep = (duration: number) => new Promise<void>((resolve) => setTimeout(resolve, duration))

    const getRow = (index: number): number => Math.floor(index / GRID_SIZE)
    const getColumn = (index: number): number => index % GRID_SIZE

    const getSpawnOrderByIndex = (index: number): number => getColumn(index) * GRID_SIZE + getRow(index)

    const getSpinOutOrderByIndex = (index: number): number => {
        const row = getRow(index)
        const column = getColumn(index)
        const isEvenColumn = column % 2 === 0
        return column * GRID_SIZE + (isEvenColumn ? row : GRID_SIZE - 1 - row)
    }

    const getSpinOutTotalDuration = (): number => SPIN_OUT_DURATION_MS + SPIN_OUT_STEP_MS * (BOARD_SIZE - 1)

    const getSpawnTotalDuration = (indices: number[]): number => {
        if (indices.length === 0) {
            return SPAWN_DURATION_MS
        }

        const maxOrder = indices.reduce((maxValue, index) => Math.max(maxValue, getSpawnOrderByIndex(index)), 0)
        return SPAWN_DURATION_MS + SPAWN_STEP_MS * maxOrder
    }

    return {
        sleep,
        getSpawnOrderByIndex,
        getSpinOutOrderByIndex,
        getSpinOutTotalDuration,
        getSpawnTotalDuration
    }
}

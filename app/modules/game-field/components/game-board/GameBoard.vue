<template>
    <div class="aspect-square w-full max-w-[420px] overflow-hidden">
        <div class="grid h-full w-full grid-cols-7 grid-rows-7 gap-1 bg-[#EDD3B2] px-3 py-1">
            <GameCell
                v-for="(cell, index) in cells"
                :key="index"
                :index="index"
                :element="cell"
                :phase="phase"
                :animation-meta="animationMeta"
                :animation-delay-ms="getAnimationDelayMs(index)"
                :show-background="isBackgroundCell(index)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    import type { AnimationMeta, CellValue, GamePhase } from '../../types/game-field.types'

    import { BOARD_SIZE, GRID_SIZE, SPAWN_STEP_MS, SPIN_OUT_STEP_MS } from '../../constants/game-field.constants'

    // Components
    import GameCell from '../game-cell/GameCell.vue'

    export interface GameBoardProps {
        board: Array<CellValue>
        phase: GamePhase
        animationMeta: AnimationMeta
    }

    // Props
    const props = defineProps<GameBoardProps>()

    // Computed
    const cells = computed<Array<CellValue>>(() => {
        if (props.board.length === BOARD_SIZE) {
            return props.board
        }

        return Array.from({ length: BOARD_SIZE }, () => null)
    })

    const isBackgroundCell = (index: number): boolean => {
        const row = Math.floor(index / GRID_SIZE)
        const column = index % GRID_SIZE
        return (row + column) % 2 === 0
    }

    const getSpinOutOrder = (row: number, column: number) => {
        const isEvenColumn = column % 2 === 0
        return column * GRID_SIZE + (isEvenColumn ? row : GRID_SIZE - 1 - row)
    }

    const getSpawnOrder = (row: number, column: number) => column * GRID_SIZE + row

    const getAnimationDelayMs = (index: number): number => {
        const row = Math.floor(index / GRID_SIZE)
        const column = index % GRID_SIZE

        if (props.phase === 'spinningOut') {
            return getSpinOutOrder(row, column) * SPIN_OUT_STEP_MS
        }

        if (props.phase === 'spawning' || props.phase === 'filling') {
            return getSpawnOrder(row, column) * SPAWN_STEP_MS
        }

        return 0
    }
</script>

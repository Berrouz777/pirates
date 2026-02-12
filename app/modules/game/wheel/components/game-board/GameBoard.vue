<template>
    <div class="aspect-square w-full overflow-hidden">
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

    import type { AnimationMeta, CellValue, GamePhase } from '../../types'

    import { BOARD_SIZE, GRID_SIZE, SPAWN_STEP_MS, SPIN_OUT_STEP_MS } from '../../constants'
    import { useAnimationTimings } from '../../composables'

    import GameCell from './components/game-cell/GameCell.vue'

    export interface GameBoardProps {
        board: Array<CellValue>
        phase: GamePhase
        animationMeta: AnimationMeta
    }

    const props = defineProps<GameBoardProps>()
    const { getSpawnOrderByIndex, getSpinOutOrderByIndex } = useAnimationTimings()

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

    const getAnimationDelayMs = (index: number): number => {
        if (props.phase === 'spinningOut') {
            return getSpinOutOrderByIndex(index) * SPIN_OUT_STEP_MS
        }

        if (props.phase === 'spawning' || props.phase === 'filling') {
            return getSpawnOrderByIndex(index) * SPAWN_STEP_MS
        }

        return 0
    }
</script>

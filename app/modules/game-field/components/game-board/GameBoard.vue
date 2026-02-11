<template>
    <div class="aspect-square w-full max-w-[420px]">
        <div class="grid h-full w-full grid-cols-7 grid-rows-7 gap-1 bg-[#EDD3B2] px-3 py-1">
            <GameCell v-for="(cell, index) in cells" :key="index" :element="cell" :show-background="isBackgroundCell(index)" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    import type { ElementType } from '../../types/game-field.types'

    import { BOARD_SIZE, GRID_SIZE } from '../../constants/game-field.constants'

    // Components
    import GameCell from '../game-cell/GameCell.vue'

    export interface GameBoardProps {
        board: Array<ElementType | null>
    }

    // Props
    const props = defineProps<GameBoardProps>()

    // Computed
    const cells = computed<Array<ElementType | null>>(() => {
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
</script>

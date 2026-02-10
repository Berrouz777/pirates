<template>
    <div class="relative flex h-full w-full items-center justify-center p-1">
        <CellBackground v-if="showBackground" class="absolute inset-0 h-full w-full" />
        <div class="relative z-10 h-full w-full">
            <GameElement v-if="element" :type="element" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { ElementType } from '../../types/game-field.types'

    // Components
    import CellBackground from '../cell-background/CellBackground.vue'
    import GameElement from '../game-element/GameElement.vue'

    export interface GameCellProps {
        element: ElementType | null
        showBackground: boolean
    }

    // Props
    defineProps<GameCellProps>()
</script>

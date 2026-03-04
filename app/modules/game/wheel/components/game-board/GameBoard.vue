<template>
    <div ref="boardRef" class="relative w-full rounded-tl-[3%] rounded-tr-[3%] bg-[#EDD3B2] px-[1.5%] pt-[3%]">
        <GameScore :balance="balance" :win="win" />

        <div data-game-grid class="grid h-full w-full grid-cols-7 grid-rows-7 gap-1 overflow-hidden bg-[#EDD3B2] px-[3%] py-[1%]" :style="gameGridStyle">
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

        <GameReward :rewards="animationMeta.rewardAnimations" :board-element="boardRef" />
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'

    import type { AnimationMeta, CellValue, GamePhase } from '../../types'

    import { BOARD_SIZE, GRID_SIZE, SPAWN_STEP_MS, SPIN_OUT_STEP_MS } from '../../constants'
    import { useAnimationTimings } from '../../composables'

    import GameCell from './components/game-cell/GameCell.vue'
    import GameReward from './components/game-reward/GameReward.vue'
    import GameScore from './components/game-score/GameScore.vue'

    export interface GameBoardProps {
        board: Array<CellValue>
        phase: GamePhase
        animationMeta: AnimationMeta
        balance: number
        win: number
        inverseScaleX?: number
    }

    const props = defineProps<GameBoardProps>()
    const { getSpawnOrderByIndex, getSpinOutOrderByIndex } = useAnimationTimings()
    const boardRef = ref<HTMLElement | null>(null)

    const cells = computed<Array<CellValue>>(() => {
        if (props.board.length === BOARD_SIZE) {
            return props.board
        }

        return Array.from({ length: BOARD_SIZE }, () => null)
    })

    const gameGridStyle = computed(() => ({
        transform: props.inverseScaleX && props.inverseScaleX !== 1 ? `scaleX(${props.inverseScaleX})` : 'none',
        transformOrigin: 'center center'
    }))

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

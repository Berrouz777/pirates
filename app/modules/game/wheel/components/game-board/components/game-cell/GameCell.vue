<template>
    <div class="relative flex h-full w-full items-center justify-center p-1">
        <CellBackground v-if="showBackground" class="absolute inset-0 h-full w-full" />

        <div class="game-element relative z-10 h-full w-full" :class="elementClass" :style="elementStyle">
            <GameElement v-if="element" :type="element" />
        </div>

        <img v-if="isClearing" class="z-9 explosion pointer-events-none absolute h-[150%] w-[150%]" src="~assets/images/explosion.png" alt="" />
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    import { GRID_SIZE } from '../../../../constants'
    import type { AnimationMeta, CellValue, GamePhase } from '../../../../types'

    import CellBackground from './components/cell-background/CellBackground.vue'
    import GameElement from './components/game-element/GameElement.vue'

    export interface GameCellProps {
        element: CellValue
        showBackground: boolean
        index: number
        phase: GamePhase
        animationMeta: AnimationMeta
        animationDelayMs: number
    }

    const props = defineProps<GameCellProps>()

    const isClearing = computed(() => props.animationMeta.removingIndices.includes(props.index))
    const isFilling = computed(() => props.animationMeta.spawnIndices.includes(props.index))
    const fallOffset = computed(() => props.animationMeta.fallOffsetsByIndex[props.index] ?? 0)

    const elementClass = computed(() => ({
        'is-spinning-out': props.phase === 'spinningOut' && !!props.element,
        'is-spawning': props.phase === 'spawning' && !!props.element,
        'is-clearing': props.phase === 'clearing' && isClearing.value && !!props.element,
        'is-falling': props.phase === 'falling' && fallOffset.value > 0 && !!props.element,
        'is-filling': props.phase === 'filling' && isFilling.value && !!props.element
    }))

    const elementStyle = computed(() => {
        const style: Record<string, string> = {}
        const travelRows = String(GRID_SIZE + 3)

        if (props.phase === 'falling' && fallOffset.value > 0) {
            style['--fall-rows'] = String(fallOffset.value)
        }

        if (props.phase === 'spinningOut') {
            style['--spin-out-rows'] = travelRows
        }

        if (props.phase === 'spawning' || props.phase === 'filling') {
            style['--spawn-rows'] = travelRows
        }

        if (props.animationDelayMs > 0) {
            style['--delay-ms'] = `${props.animationDelayMs}ms`
        }

        return Object.keys(style).length ? style : undefined
    })
</script>

<style scoped>
    .game-element {
        will-change: transform, opacity;
        transform-origin: bottom;
    }

    .game-element.is-spinning-out {
        animation: spin-out 400ms ease-in both;
        animation-delay: var(--delay-ms, 0ms);
    }

    .game-element.is-spawning {
        animation: spawn-in 400ms ease-in both;
        animation-delay: var(--delay-ms, 0ms);
    }

    .game-element.is-clearing {
        animation: pop-clear 300ms ease-in both;
    }

    .game-element.is-falling {
        animation: fall 400ms ease-in both;
    }

    .game-element.is-filling {
        animation: spawn-in 400ms ease-out both;
        animation-delay: var(--delay-ms, 0ms);
    }

    @keyframes spin-out {
        from {
            transform: translateY(0) scaleY(1);
        }
        to {
            transform: translateY(calc(var(--spin-out-rows, 1) * 100%)) scale(0.9, 1.2);
        }
    }

    @keyframes spawn-in {
        0% {
            transform: translateY(calc(var(--spawn-rows, 1) * -100%)) scale(1, 1);
        }
        5% {
            transform: translateY(calc(var(--spawn-rows, 1) * -100%)) scale(0.9, 1.2);
        }
        60% {
            transform: translateY(0) scale(0.9, 1.2);
        }
        80% {
            transform: translateY(0) scale(1.2, 0.9);
        }
        90% {
            transform: translateY(0) scale(1.1, 0.9);
        }
        100% {
            transform: translateY(0) scale(1, 1);
        }
    }

    @keyframes pop-clear {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        40% {
            transform: scale(1.2);
            opacity: 1;
        }
        100% {
            transform: scale(0.8);
            opacity: 0;
        }
    }

    @keyframes fall {
        0% {
            transform: translateY(calc(var(--fall-rows) * -100%)) scale(1, 1);
        }
        5% {
            transform: translateY(calc(var(--fall-rows) * -100%)) scale(0.9, 1.2);
        }
        60% {
            transform: translateY(0) scale(0.9, 1.2);
        }
        80% {
            transform: translateY(0) scale(1.2, 0.9);
        }
        90% {
            transform: translateY(0) scale(1.1, 0.9);
        }
        100% {
            transform: translateY(0) scale(1, 1);
        }
    }

    .explosion {
        transform-origin: center;
        animation: explosion-scale 350ms ease-out both;
    }

    @keyframes explosion-scale {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        30% {
            transform: scale(1.3);
            opacity: 1;
        }
        100% {
            transform: scale(1.5);
            opacity: 0;
        }
    }
</style>

<template>
    <div :data-cell-index="index" :data-bonus-source-index="index" class="relative flex h-full w-full items-center justify-center p-1">
        <CellBackground v-if="showBackground" class="absolute inset-0 h-full w-full" />

        <div class="game-element relative z-10 h-full w-full" :class="elementClass" :style="elementStyle" :data-bonus-element="isBonusElement ? '' : undefined">
            <GameElement v-if="element" :type="element" />
        </div>

        <ExplosionEffect v-if="isClearing" />
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    import { CLEAR_DURATION_MS, FALL_DURATION_MS, FILL_DURATION_MS, SPIN_OUT_DURATION_MS, SPAWN_DURATION_MS } from '../../../../constants/animation.constants'
    import { GRID_SIZE } from '../../../../constants'
    import type { AnimationMeta, CellValue, GamePhase } from '../../../../types'

    import CellBackground from './components/cell-background/CellBackground.vue'
    import ExplosionEffect from './components/explosion-effect/ExplosionEffect.vue'
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
    const isBonusElement = computed(() => props.element === 'bonus-game')
    const isHiddenBonusOriginal = computed(() => props.animationMeta.hiddenBonusIndices.includes(props.index))

    const elementClass = computed(() => ({
        'is-spinning-out': props.phase === 'spinningOut' && !!props.element,
        'is-spawning': props.phase === 'spawning' && !!props.element,
        'is-clearing': props.phase === 'clearing' && isClearing.value && !!props.element && !isBonusElement.value,
        'is-clearing-bonus': props.phase === 'clearing' && isClearing.value && !!props.element && isBonusElement.value,
        'is-falling': props.phase === 'falling' && fallOffset.value > 0 && !!props.element,
        'is-filling': props.phase === 'filling' && isFilling.value && !!props.element,
        'is-hidden-bonus-original': isHiddenBonusOriginal.value && isBonusElement.value
    }))

    const elementStyle = computed(() => {
        const style: Record<string, string> = {
            '--spin-out-duration': `${SPIN_OUT_DURATION_MS}ms`,
            '--spawn-duration': `${SPAWN_DURATION_MS}ms`,
            '--clear-duration': `${CLEAR_DURATION_MS}ms`,
            '--fall-duration': `${FALL_DURATION_MS}ms`,
            '--fill-duration': `${FILL_DURATION_MS}ms`
        }
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

        return style
    })
</script>

<style scoped>
    .game-element {
        will-change: transform, opacity;
        transform-origin: bottom;
    }

    .game-element.is-spinning-out {
        animation: spin-out var(--spin-out-duration, 400ms) ease-in both;
        animation-delay: var(--delay-ms, 0ms);
    }

    .game-element.is-spawning {
        animation: spawn-in var(--spawn-duration, 400ms) ease-in both;
        animation-delay: var(--delay-ms, 0ms);
    }

    .game-element.is-clearing {
        animation: pop-clear var(--clear-duration, 400ms) ease-in both;
    }

    .game-element.is-clearing-bonus {
        transform-origin: center center;
        opacity: 1;
        animation: bonus-clear-spin var(--clear-duration, 400ms) ease-out both;
    }

    .game-element.is-hidden-bonus-original {
        opacity: 0;
    }

    .game-element.is-falling {
        animation: fall var(--fall-duration, 400ms) ease-in both;
    }

    .game-element.is-filling {
        animation: spawn-in var(--fill-duration, 400ms) ease-out both;
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
        20% {
            transform: scale(1.2);
            opacity: 1;
        }
        60%,
        100% {
            transform: scale(0.8);
            opacity: 0;
        }
    }

    @keyframes bonus-clear-spin {
        0% {
            transform: scale(1) rotate(0deg);
        }
        25% {
            transform: scale(1.25) rotate(90deg);
            opacity: 0;
        }
        50% {
            transform: scale(1.5) rotate(180deg);
        }
        75% {
            transform: scale(1.25) rotate(270deg);
            opacity: 1;
        }
        100% {
            transform: scale(1) rotate(360deg);
        }
    }

    @keyframes fall {
        0% {
            /* Учитываем шаг между ячейками: высота элемента + p-1 сверху/снизу + gap-1 */
            transform: translateY(calc(var(--fall-rows) * (-100% - 0.75rem))) scale(1, 1);
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
</style>

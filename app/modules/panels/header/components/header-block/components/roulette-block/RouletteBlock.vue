<template>
    <div v-show="isVisible" class="absolute inset-0 z-10 flex h-full w-full items-center justify-center overflow-hidden">
        <img
            :src="boxImage"
            alt="box"
            class="roulette-box absolute inset-0 m-auto h-full w-[55%] object-contain"
            :class="{ 'roulette-box--visible': showChest && !isExiting, 'roulette-box--exiting': isExiting }"
            :style="animationCssVars"
        />
        <div
            class="roulette-panel pointer-events-none absolute bottom-[20%] left-1/2 z-10 w-full"
            :class="{ 'roulette-panel--visible': showRoulette && !isExiting, 'roulette-panel--exiting': isExiting }"
            :style="animationCssVars"
        >
            <div ref="viewportRef" class="roulette-viewport relative w-full overflow-hidden border-[0.11rem] border-solid border-[#B3EEED]">
                <div ref="trackRef" class="flex h-full items-stretch gap-[2%] px-[2%] py-[3%] will-change-transform" :style="trackStyle">
                    <div
                        v-for="cell in ribbonCells"
                        :key="cell.renderKey"
                        class="roulette-card relative h-full min-h-[28.4%] shrink-0 grow-0 basis-[28.4%] overflow-hidden rounded-[5%]"
                        :class="{ 'roulette-card--empty': cell.key === 'empty' }"
                    >
                        <img
                            v-if="cell.imageSrc"
                            :src="cell.imageSrc"
                            alt=""
                            class="h-full w-full object-contain"
                            :class="{ 'roulette-card__image--empty': cell.key === 'empty' }"
                        />
                    </div>
                </div>
            </div>

            <SvgRoulettePointer v-if="showRoulette" ref="pointerRef" class="absolute inset-0 -top-[10%] left-0 right-0 mx-auto" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import { useRouletteSpin } from './composables/use-roulette-spin'
    import type { RouletteRenderCell, RouletteSpinResult } from './types/roulette.types'
    import { ROULETTE_CELLS } from './constants/roulette-cells.constants'
    import {
        CHEST_APPEAR_MS,
        FALLBACK_CELL_GAP_PX,
        FALLBACK_CELL_WIDTH_PX,
        MAX_FULL_LOOPS,
        RIBBON_REPEAT_COUNT,
        ROULETTE_SLIDE_MS,
        SPIN_DURATION_MS
    } from './constants/roulette.constants'

    import boxImage from '~/assets/images/header/box.png'
    import SvgRoulettePointer from './components/svg-roulette-pointer/SvgRoulettePointer.vue'

    interface RouletteBlockProps {
        isVisible: boolean
        showChest: boolean
        showRoulette: boolean
        isExiting: boolean
        spinTrigger: number
        targetCellIndex: number | null
    }

    const props = defineProps<RouletteBlockProps>()

    const emit = defineEmits<{
        (eventName: 'spin-finished', payload: RouletteSpinResult): void
    }>()

    const pointerRef = ref<{ $el: HTMLElement } | null>(null)
    const rouletteCells = ROULETTE_CELLS
    const { viewportRef, trackRef, trackStyle, startSpin } = useRouletteSpin({
        cellCount: rouletteCells.length,
        ribbonRepeatCount: RIBBON_REPEAT_COUNT,
        spinDurationMs: SPIN_DURATION_MS,
        maxFullLoops: MAX_FULL_LOOPS,
        fallbackCellWidthPx: FALLBACK_CELL_WIDTH_PX,
        fallbackCellGapPx: FALLBACK_CELL_GAP_PX,
        getPointerCenterX: () => {
            const el = pointerRef.value?.$el
            const viewportEl = viewportRef.value
            if (!el || !viewportEl) return null
            const pointerRect = el.getBoundingClientRect()
            const viewportRect = viewportEl.getBoundingClientRect()
            return pointerRect.left + pointerRect.width / 2 - viewportRect.left
        }
    })

    const ribbonCells = computed<RouletteRenderCell[]>(() =>
        Array.from({ length: RIBBON_REPEAT_COUNT }, (_, repeatIndex) =>
            rouletteCells.map((cell, localIndex) => ({
                ...cell,
                renderKey: `${cell.key}-${repeatIndex}`,
                slotIndex: repeatIndex * rouletteCells.length + localIndex
            }))
        ).flat()
    )

    const animationCssVars = {
        '--chest-appear-ms': `${CHEST_APPEAR_MS}ms`,
        '--roulette-slide-ms': `${ROULETTE_SLIDE_MS}ms`
    }

    watch(
        () => props.spinTrigger,
        async (nextTrigger, previousTrigger) => {
            if (nextTrigger <= 0 || nextTrigger === previousTrigger || props.targetCellIndex === null) {
                return
            }

            const spinResult = await startSpin(props.targetCellIndex)
            if (!spinResult) {
                return
            }

            emit('spin-finished', spinResult)
        }
    )
</script>

<style scoped>
    .roulette-box {
        opacity: 0;
        transform: translateY(125%) scale(0.65);
    }

    .roulette-box--visible {
        opacity: 1;
        animation: chest-rise-in var(--chest-appear-ms) cubic-bezier(0.25, 1.1, 0.4, 1) both;
    }

    .roulette-box--exiting {
        animation: chest-fall-out var(--chest-appear-ms) cubic-bezier(0.45, 0, 0.75, 0.15) both;
    }

    .roulette-panel {
        transform: translateX(170%);
        transition: transform var(--roulette-slide-ms) cubic-bezier(0.25, 1.1, 0.4, 1);
    }

    .roulette-panel--visible {
        transform: translateX(-50%);
    }

    .roulette-panel--exiting {
        transform: translateX(-180%);
    }

    .roulette-viewport {
        background: linear-gradient(180deg, rgba(133, 200, 206, 0.6) 0%, rgba(0, 41, 116, 0.6) 100%);
    }

    .roulette-card--empty {
        border-color: rgba(153, 204, 255, 0.7);
        background: linear-gradient(180deg, rgba(84, 140, 209, 0.65) 0%, rgba(40, 76, 136, 0.7) 100%);
    }

    @keyframes chest-rise-in {
        0% {
            opacity: 0;
            transform: translateY(125%) scale(0.65);
        }

        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @keyframes chest-fall-out {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        100% {
            opacity: 0;
            transform: translateY(125%) scale(0.65);
        }
    }
</style>

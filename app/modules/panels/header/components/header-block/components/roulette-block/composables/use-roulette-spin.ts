import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { RouletteSpinResult } from '../types/roulette.types'

export interface UseRouletteSpinOptions {
    cellCount: number
    ribbonRepeatCount: number
    spinDurationMs: number
    minFullLoops: number
    maxFullLoops: number
    fallbackCellWidthPx: number
    fallbackCellGapPx: number
}

export const useRouletteSpin = (options: UseRouletteSpinOptions) => {
    const viewportRef = ref<HTMLDivElement | null>(null)
    const trackRef = ref<HTMLDivElement | null>(null)
    const currentOffsetPx = ref<number>(0)
    const isRolling = ref<boolean>(false)
    const activeSlotIndex = ref<number | null>(null)
    const animationFrameId = ref<number | null>(null)
    let resizeObserver: ResizeObserver | null = null

    const totalSlots = computed(() => options.cellCount * options.ribbonRepeatCount)

    const trackStyle = computed(() => ({
        transform: `translate3d(${-currentOffsetPx.value}px, 0, 0)`
    }))

    const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3

    const stopAnimationFrame = () => {
        if (animationFrameId.value === null) {
            return
        }

        cancelAnimationFrame(animationFrameId.value)
        animationFrameId.value = null
    }

    const animateOffset = (from: number, to: number, durationMs: number) => {
        return new Promise<void>((resolve) => {
            const startTime = performance.now()

            const step = (now: number) => {
                const progress = Math.min((now - startTime) / durationMs, 1)
                const eased = easeOutCubic(progress)
                currentOffsetPx.value = from + (to - from) * eased

                if (progress < 1) {
                    animationFrameId.value = requestAnimationFrame(step)
                    return
                }

                animationFrameId.value = null
                resolve()
            }

            animationFrameId.value = requestAnimationFrame(step)
        })
    }

    const getCellStepPx = () => {
        const firstCard = trackRef.value?.querySelector<HTMLElement>('.roulette-card')
        if (!firstCard) {
            return options.fallbackCellWidthPx + options.fallbackCellGapPx
        }

        const secondCard = firstCard.nextElementSibling as HTMLElement | null
        if (secondCard) {
            return secondCard.getBoundingClientRect().left - firstCard.getBoundingClientRect().left
        }

        const trackStyles = trackRef.value ? getComputedStyle(trackRef.value) : null
        const gapValue = trackStyles?.columnGap || trackStyles?.gap || '0'
        const parsedGap = Number.parseFloat(gapValue)
        const gap = Number.isFinite(parsedGap) ? parsedGap : options.fallbackCellGapPx

        return firstCard.getBoundingClientRect().width + gap
    }

    const getViewportCenter = () => (viewportRef.value?.clientWidth ?? 0) / 2

    const getOffsetBySlot = (slotIndex: number, cellStepPx: number) => {
        return slotIndex * cellStepPx + cellStepPx / 2 - getViewportCenter()
    }

    const alignToActiveSlot = () => {
        if (isRolling.value || activeSlotIndex.value === null) {
            return
        }

        currentOffsetPx.value = getOffsetBySlot(activeSlotIndex.value, getCellStepPx())
    }

    const normalizeCellIndex = (targetCellIndex: number) => {
        if (options.cellCount <= 0) {
            return 0
        }

        const normalized = targetCellIndex % options.cellCount
        return normalized < 0 ? normalized + options.cellCount : normalized
    }

    const startSpin = async (targetCellIndex: number): Promise<RouletteSpinResult | null> => {
        if (isRolling.value || options.cellCount <= 0) {
            return null
        }

        stopAnimationFrame()
        isRolling.value = true
        activeSlotIndex.value = null

        const cellStep = getCellStepPx()
        const fromOffset = currentOffsetPx.value
        const selectedCellIndex = normalizeCellIndex(targetCellIndex)
        const fullLoops = options.maxFullLoops
        const maxSlot = totalSlots.value - 1
        let targetSlot = fullLoops * options.cellCount + selectedCellIndex
        let targetOffset = getOffsetBySlot(targetSlot, cellStep)

        while (targetOffset <= fromOffset + cellStep * 2 && targetSlot + options.cellCount <= maxSlot) {
            targetSlot += options.cellCount
            targetOffset = getOffsetBySlot(targetSlot, cellStep)
        }

        while (targetSlot > maxSlot) {
            targetSlot -= options.cellCount
        }

        targetOffset = getOffsetBySlot(targetSlot, cellStep)

        await animateOffset(fromOffset, targetOffset, options.spinDurationMs)
        currentOffsetPx.value = targetOffset
        activeSlotIndex.value = targetSlot
        isRolling.value = false

        return {
            selectedCellIndex,
            selectedSlotIndex: targetSlot
        }
    }

    onMounted(() => {
        if (!viewportRef.value) {
            return
        }

        resizeObserver = new ResizeObserver(() => {
            alignToActiveSlot()
        })
        resizeObserver.observe(viewportRef.value)
    })

    onBeforeUnmount(() => {
        stopAnimationFrame()
        resizeObserver?.disconnect()
        resizeObserver = null
    })

    return {
        viewportRef,
        trackRef,
        trackStyle,
        isRolling,
        startSpin
    }
}

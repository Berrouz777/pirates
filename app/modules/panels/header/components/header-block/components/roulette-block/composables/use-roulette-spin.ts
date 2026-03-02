import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { RouletteSpinResult } from '../types/roulette.types'

export interface UseRouletteSpinOptions {
    cellCount: number
    ribbonRepeatCount: number
    spinDurationMs: number
    maxFullLoops: number
    fallbackCellWidthPx: number
    fallbackCellGapPx: number
    // Возвращает X-координату центра pointer относительно левого края viewport.
    // Если не задан — используется геометрический центр viewport.
    getPointerCenterX?: () => number | null
}

interface CellMetrics {
    step: number
    width: number
    firstCardOffset: number
}

export const useRouletteSpin = (options: UseRouletteSpinOptions) => {
    const viewportRef = ref<HTMLDivElement | null>(null)
    const trackRef = ref<HTMLDivElement | null>(null)
    const currentOffsetPx = ref<number>(0)
    // Чистый offset без jitter — используется как база для следующего спина
    let baseOffsetPx = 0
    let activeSlotIndex: number | null = null
    let animationFrameId: number | null = null
    const isRolling = ref<boolean>(false)
    let resizeObserver: ResizeObserver | null = null

    const totalSlots = computed(() => options.cellCount * options.ribbonRepeatCount)

    const trackStyle = computed(() => ({
        transform: `translate3d(${-currentOffsetPx.value}px, 0, 0)`
    }))

    const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3

    const stopAnimationFrame = () => {
        if (animationFrameId === null) return
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
    }

    const animateOffset = (from: number, to: number, durationMs: number) => {
        return new Promise<void>((resolve) => {
            const startTime = performance.now()

            const tick = (now: number) => {
                const progress = Math.min((now - startTime) / durationMs, 1)
                currentOffsetPx.value = from + (to - from) * easeOutCubic(progress)

                if (progress < 1) {
                    animationFrameId = requestAnimationFrame(tick)
                    return
                }

                animationFrameId = null
                resolve()
            }

            animationFrameId = requestAnimationFrame(tick)
        })
    }

    const getCellMetrics = (): CellMetrics => {
        const track = trackRef.value
        const firstCard = track?.querySelector<HTMLElement>('.roulette-card')
        if (!track || !firstCard) {
            return {
                step: options.fallbackCellWidthPx + options.fallbackCellGapPx,
                width: options.fallbackCellWidthPx,
                firstCardOffset: 0
            }
        }

        // translate3d одинаково сдвигает трек и карточки — разность left не зависит от текущего offset
        const trackRect = track.getBoundingClientRect()
        const firstCardRect = firstCard.getBoundingClientRect()
        const secondCard = firstCard.nextElementSibling as HTMLElement | null

        return {
            firstCardOffset: firstCardRect.left - trackRect.left,
            width: firstCardRect.width,
            step: secondCard ? secondCard.getBoundingClientRect().left - firstCardRect.left : firstCardRect.width + options.fallbackCellGapPx
        }
    }

    const getPointerX = () => {
        const custom = options.getPointerCenterX?.()
        return custom ?? (viewportRef.value?.clientWidth ?? 0) / 2
    }

    // Случайное смещение pointer внутри ячейки (±35% от ширины)
    const getJitter = (cellWidthPx: number) => (Math.random() * 2 - 1) * cellWidthPx * 0.35

    // Трековый offset при котором центр ячейки slotIndex совпадает с pointer (+ опциональный jitter)
    const slotToOffset = ({ step, width, firstCardOffset }: CellMetrics, slotIndex: number, jitter = 0) => {
        return firstCardOffset + slotIndex * step + width / 2 + jitter - getPointerX()
    }

    const alignToActiveSlot = () => {
        if (isRolling.value || activeSlotIndex === null) return
        const metrics = getCellMetrics()
        const offset = slotToOffset(metrics, activeSlotIndex)
        currentOffsetPx.value = offset
        baseOffsetPx = offset
    }

    const normalizeCellIndex = (index: number) => {
        if (options.cellCount <= 0) return 0
        const n = index % options.cellCount
        return n < 0 ? n + options.cellCount : n
    }

    const startSpin = async (targetCellIndex: number): Promise<RouletteSpinResult | null> => {
        if (isRolling.value || options.cellCount <= 0) return null

        stopAnimationFrame()
        isRolling.value = true
        activeSlotIndex = null

        currentOffsetPx.value = 0
        baseOffsetPx = 0

        const metrics = getCellMetrics()
        const jitter = getJitter(metrics.width)
        const selectedCellIndex = normalizeCellIndex(targetCellIndex)
        const maxSlot = totalSlots.value - 1

        // Начинаем с позиции после maxFullLoops полных оборотов
        let targetSlot = options.maxFullLoops * options.cellCount + selectedCellIndex

        // Гарантируем достаточное расстояние прокрутки от текущей позиции
        while (slotToOffset(metrics, targetSlot) <= baseOffsetPx + metrics.step * 2 && targetSlot + options.cellCount <= maxSlot) {
            targetSlot += options.cellCount
        }

        // Не выходим за пределы ленты
        while (targetSlot > maxSlot) {
            targetSlot -= options.cellCount
        }

        const cleanTargetOffset = slotToOffset(metrics, targetSlot)
        const targetOffset = cleanTargetOffset + jitter

        await animateOffset(currentOffsetPx.value, targetOffset, options.spinDurationMs)
        currentOffsetPx.value = targetOffset
        baseOffsetPx = cleanTargetOffset
        activeSlotIndex = targetSlot
        isRolling.value = false

        return { selectedCellIndex, selectedSlotIndex: targetSlot }
    }

    onMounted(() => {
        if (!viewportRef.value) return
        resizeObserver = new ResizeObserver(alignToActiveSlot)
        resizeObserver.observe(viewportRef.value)
    })

    onBeforeUnmount(() => {
        stopAnimationFrame()
        resizeObserver?.disconnect()
        resizeObserver = null
    })

    return { viewportRef, trackRef, trackStyle, isRolling, startSpin }
}

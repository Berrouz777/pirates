<template>
    <Teleport to="body">
        <div v-if="renderedFlights.length" class="pointer-events-none fixed inset-0 z-[80] overflow-visible">
            <div
                v-for="flight in renderedFlights"
                :key="flight.id"
                class="bonus-flight"
                :class="{ 'bonus-flight--active': isActive }"
                :style="flight.style"
                :data-bonus-flight-id="flight.id"
            >
                <img :src="bonusImage" alt="bonus flight element" class="h-full w-full object-contain" />
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
    import { nextTick, ref, watch } from 'vue'
    import type { BonusFlightAnimationMeta } from '../../../../types'
    import { useBonusFlightPositioning } from './composables/useBonusFlightPositioning'

    import bonusImage from '~/assets/images/elements/bonus-swords.png'

    interface BonusFlightOverlayProps {
        flights: BonusFlightAnimationMeta[]
        boardElement: HTMLElement | null
    }

    const props = defineProps<BonusFlightOverlayProps>()
    const { renderedFlights } = useBonusFlightPositioning({
        flights: () => props.flights,
        boardElement: () => props.boardElement
    })
    const isActive = ref(false)

    watch(
        () => props.flights,
        async () => {
            isActive.value = false

            if (!renderedFlights.value.length) {
                return
            }

            await nextTick()
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    isActive.value = true
                })
            })
        },
        { deep: true, immediate: true }
    )
</script>

<style scoped>
    .bonus-flight {
        position: absolute;
        transform: translate(-50%, -50%) scale(1);
        will-change: transform;
        transition: transform var(--bonus-fly-duration, 420ms) ease-in;
        transition-delay: var(--bonus-fly-delay, 0ms);
    }

    .bonus-flight--active {
        transform: translate(calc(-50% + var(--bonus-fly-x, 0px)), calc(-50% + var(--bonus-fly-y, 0px))) scale(0.2);
    }
</style>

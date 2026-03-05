<template>
    <div class="flex items-end">
        <p class="absolute -left-[2%] top-[10%] font-coda-caption text-game-lg capitalize text-white">
            {{ $t('pirates.game.bonusgame') }}
        </p>
        <div class="z-[1] -mr-[8%] mb-[8.8%] h-[5.2%] w-full">
            <div class="relative h-full w-full overflow-hidden rounded-full">
                <div
                    class="bonus-progress__fill relative h-full rounded-full bg-[linear-gradient(90deg,_#ef9c16_0%,_#f95326_100%)]"
                    :style="{ width: progressPercent + '%' }"
                />
            </div>
        </div>
        <img :src="bonusImage" alt="bonus image" data-bonus-target class="pointer-events-none z-[2] h-full w-[30%] object-contain" />
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { storeToRefs } from 'pinia'
    import { useWheelStore } from '~/modules/game/wheel'

    import bonusImage from '~/assets/images/footer/bonus.png'

    const wheelStore = useWheelStore()
    const { bonusProgress } = storeToRefs(wheelStore)

    const progressPercent = computed(() => bonusProgress.value)
</script>

<style scoped>
    .bonus-progress__fill {
        transition: width 400ms ease-out;
    }
</style>

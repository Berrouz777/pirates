<template>
    <div class="relative">
        <img :src="scoreImage" alt="score image" class="m-auto w-full object-contain" />

        <div class="absolute top-0 h-full w-full pb-[1%] pl-[10%] pr-[15%]">
            <div class="relative flex h-full items-center justify-between">
                <p class="font-cuprum text-game-base text-white">{{ $t('pirates.game.balance') }}: {{ balance }}</p>
                <p v-if="isMultipleBonusActive" class="pointer-events-none absolute left-[46%] top-[32%] font-cuprum text-game-base text-[#ffe788]">
                    {{ remainingMultipleSpins }}/10
                </p>
                <div class="relative">
                    <p class="font-cuprum text-game-base text-white">{{ $t('pirates.game.win') }}: {{ win }}</p>
                    <span data-win-target class="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { storeToRefs } from 'pinia'
    import scoreImage from '~/assets/images/header/score-table.png'
    import { useWheelStore } from '~/modules/game/wheel'

    export interface GameScoreProps {
        balance: number
        win: number
    }

    defineProps<GameScoreProps>()

    const wheelStore = useWheelStore()
    const { activeBonusEffect } = storeToRefs(wheelStore)

    const isMultipleBonusActive = computed(() => activeBonusEffect.value?.prizeType === 'multiple' && activeBonusEffect.value.remainingSpins > 0)

    const remainingMultipleSpins = computed(() => (activeBonusEffect.value?.prizeType === 'multiple' ? activeBonusEffect.value.remainingSpins : 0))
</script>

<template>
    <div class="relative">
        <img :src="scoreImage" alt="score image" class="m-auto w-full object-contain" />

        <div class="absolute top-0 h-full w-full px-[10%] pb-[1%]">
            <div class="flex h-full items-center">
                <p class="font-cuprum text-game-base text-white">{{ $t('pirates.game.balance') }}: {{ balance }}</p>
                <div class="relative ml-[43%]">
                    <p class="font-cuprum text-game-base text-white">{{ $t('pirates.game.win') }}: {{ win }}</p>
                    <span data-win-target class="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import scoreImage from '~/assets/images/header/score-table.png'

    export interface GameScoreProps {
        balance: number
        win: number
    }

    defineProps<GameScoreProps>()
</script>

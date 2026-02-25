<template>
    <div class="relative h-full min-h-[23.8%] w-full overflow-hidden">
        <img alt="header image" :src="bgImage" class="h-full w-full object-contain" />
        <SignBoard v-show="isSignBoardVisible" class="z-20" :animation-state="animationState">
            <Transition :name="signContentTransitionName" :mode="signContentTransitionMode">
                <component :is="currentContentComponent" :key="currentContentKey" :text="currentText" />
            </Transition>
        </SignBoard>
        <RouletteBlock
            :is-visible="isRouletteVisible"
            :show-chest="isRouletteChestVisible"
            :show-roulette="isRoulettePanelVisible"
            :is-exiting="isRouletteExiting"
            :spin-trigger="spinTrigger"
            :target-cell-index="targetCellIndex"
            @spin-finished="handleSpinFinished"
        />
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import bgImage from '~/assets/images/header/top-background.png'
    import SignBoard from './components/sign-board/SignBoard.vue'
    import BigWinContent from './components/sign-board/components/big-win-content/BigWinContent.vue'
    import BonusGameContent from './components/sign-board/components/bonus-game-content/BonusGameContent.vue'
    import WinMultipleContent from './components/sign-board/components/win-multiple-content/WinMultipleContent.vue'
    import FreeSpinsContent from './components/sign-board/components/free-spins-content/FreeSpinsContent.vue'
    import WinJackpotContent from './components/sign-board/components/win-jackpot-content/WinJackpotContent.vue'
    import RouletteBlock from './components/roulette-block/RouletteBlock.vue'
    import { useHeaderBonusFlow } from './composables/use-header-bonus-flow'
    import type { HeaderSignboardVariant } from '~/modules/panels/header/types/header-signboard.types'

    const {
        currentVariant,
        animationState,
        isSignBoardVisible,
        isRouletteVisible,
        isRouletteChestVisible,
        isRoulettePanelVisible,
        isRouletteExiting,
        currentText,
        targetCellIndex,
        signContentTransitionName,
        signContentTransitionMode,
        spinTrigger,
        handleSpinFinished
    } = useHeaderBonusFlow()

    const signboardContentByVariant: Record<HeaderSignboardVariant, unknown> = {
        BIG_WIN: BigWinContent,
        BONUS_GAME: BonusGameContent,
        WIN_MULTIPLE: WinMultipleContent,
        FREESPINS: FreeSpinsContent,
        WIN_JACKPOT: WinJackpotContent
    }

    const currentContentComponent = computed(() => signboardContentByVariant[currentVariant.value] ?? BigWinContent)
    const currentContentKey = computed(() => currentVariant.value)
</script>

<style scoped>
    .sign-content-scale-enter-active,
    .sign-content-scale-leave-active {
        transition:
            transform 320ms ease,
            opacity 320ms ease;
        transform-origin: center center;
    }

    .sign-content-scale-enter-from,
    .sign-content-scale-leave-to {
        opacity: 0;
        transform: scale(0);
    }
</style>

<template>
    <div
        class="relative flex h-screen w-full touch-none items-center justify-center overflow-hidden [padding-bottom:env(safe-area-inset-bottom)] [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)] [padding-top:env(safe-area-inset-top)] supports-[height:100svh]:h-svh"
    >
        <div class="flex w-full items-center justify-center">
            <div class="game-container flex w-full max-w-[420px] flex-col items-center justify-center bg-[#EDD3B2]">
                <HeaderBlock />
                <div class="relative w-full">
                    <GameBoard :board="board" :phase="phase" :animation-meta="animationMeta" />
                </div>
                <FooterBlock :is-spinning="isSpinning" @spin="spin" />
            </div>
        </div>

        <OrientationOverlay />
    </div>
</template>

<script setup lang="ts">
    import { onMounted } from 'vue'
    import { storeToRefs } from 'pinia'

    // Components
    import GameBoard from '~/modules/game-field/components/game-board/GameBoard.vue'
    import FooterBlock from '~/modules/footer-panel/components/footer-block/FooterBlock.vue'
    import HeaderBlock from '~/modules/header-panel/components/header-block/HeaderBlock.vue'
    import OrientationOverlay from '~/shared/ui/orientation/OrientationOverlay.vue'

    // Stores
    import { useGameFieldStore } from '~/modules/game-field/store/game-field.store'

    // Bindings
    const gameFieldStore = useGameFieldStore()
    const { board, isSpinning, phase, animationMeta } = storeToRefs(gameFieldStore)

    // Methods
    const spin = () => gameFieldStore.spin()

    // Hooks
    onMounted(() => {
        gameFieldStore.initBoard()
    })
</script>

<style scoped>
    .game-container {
        width: min(100vw, calc(100svh / 2));
    }

    @supports not (height: 100svh) {
        .game-container {
            width: min(100vw, calc(100vh / 2));
        }
    }
</style>

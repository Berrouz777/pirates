<template>
    <div
        class="relative flex h-screen w-full touch-none items-center justify-center overflow-hidden [padding-bottom:env(safe-area-inset-bottom)] [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)] [padding-top:env(safe-area-inset-top)] supports-[height:100svh]:h-svh"
    >
        <div class="flex w-full items-center justify-center">
            <div class="game-container flex flex-col items-center justify-center bg-[#EDD3B2]">
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
    import { GameBoard, useWheelStore } from '~/modules/game/wheel'
    import { FooterBlock } from '~/modules/panels/footer'
    import { HeaderBlock } from '~/modules/panels/header'
    import OrientationOverlay from '~/shared/ui/orientation/OrientationOverlay.vue'

    // Bindings
    const wheelStore = useWheelStore()
    const { spin, initBoard } = wheelStore
    const { board, isSpinning, phase, animationMeta } = storeToRefs(wheelStore)

    // Hooks
    onMounted(() => initBoard())
</script>

<style scoped>
    .game-container {
        width: min(100vw, calc(100svh / 1.93));
    }

    @supports not (height: 100svh) {
        .game-container {
            width: min(100vw, calc(100vh / 1.93));
        }
    }
</style>

<template>
    <div
        class="page-root relative flex h-screen w-full touch-none items-center justify-center overflow-hidden [padding-bottom:env(safe-area-inset-bottom)] [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)] [padding-top:env(safe-area-inset-top)] supports-[height:100svh]:h-svh"
    >
        <div ref="gameStretchShellRef" class="game-stretch-shell">
            <div ref="gameContainerRef" :style="gameContainerStyle" class="game-container flex flex-col items-center justify-center bg-[#57d5e8]">
                <HeaderBlock />
                <div class="relative w-full">
                    <GameBoard :board="board" :phase="phase" :animation-meta="animationMeta" :balance="balance" :win="lastWinAmount" />
                </div>
                <FooterBlock :is-spinning="isSpinning" :is-controls-locked="isControlsLocked" @spin="spin" />
            </div>
        </div>

        <OrientationOverlay />
    </div>
</template>

<script setup lang="ts">
    import { GameBoard, useWheelStore } from '~/modules/game/wheel'
    import { FooterBlock } from '~/modules/panels/footer'
    import { HeaderBlock } from '~/modules/panels/header'
    import { useMobileGameStretch } from '~/shared/composables/utils/useMobileGameStretch'
    import OrientationOverlay from '~/shared/ui/orientation/OrientationOverlay.vue'

    // Bindings
    const wheelStore = useWheelStore()
    const { spin, initBoard } = wheelStore
    const { board, isSpinning, isBonusAnimationPlaying, phase, animationMeta, balance, lastWinAmount } = storeToRefs(wheelStore)
    const isControlsLocked = computed(() => isSpinning.value || isBonusAnimationPlaying.value)
    const { gameStretchShellRef, gameContainerRef, gameContainerStyle } = useMobileGameStretch({ mobileMaxWidth: 599 })

    // Hooks
    onMounted(() => initBoard())
</script>

<style scoped>
    .game-container {
        width: min(100vw, calc(100svh / 2.2));
        container-type: inline-size;
        container-name: game;
        transform-origin: center center;
    }

    @supports not (height: 100svh) {
        .game-container {
            width: min(100vw, calc(100vh / 2.2));
        }

        @media (max-width: 599px) {
            .game-container {
                width: min(100vw, calc(100vh / 2));
            }
        }
    }

    @media (max-width: 599px) {
        .game-container {
            width: min(100vw, calc(100svh / 2));
        }

        .game-stretch-shell {
            width: 100vw;
            display: flex;
            justify-content: center;
            overflow: hidden;
        }
    }
</style>

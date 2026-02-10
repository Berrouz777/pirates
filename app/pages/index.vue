<template>
    <div
        ref="viewportRef"
        class="relative flex h-screen w-full items-center justify-center overflow-hidden [padding-bottom:env(safe-area-inset-bottom)] [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)] [padding-top:env(safe-area-inset-top)] supports-[height:100svh]:h-svh"
    >
        <div class="flex h-full w-full items-center justify-center">
            <div class="origin-center" :style="scaleStyle">
                <div ref="gameRef" class="flex w-[390px] max-w-full flex-col items-center justify-center">
                    <HeaderBlock />
                    <div class="relative w-full">
                        <GameBoard :board="board" />
                    </div>
                    <FooterBlock :is-spinning="isSpinning" @spin="spin" />
                </div>
            </div>
        </div>

        <div v-if="isLandscape" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 text-center text-white">
            <p class="text-lg font-semibold">
                {{ $t('pirates.orientation.rotate_to_portrait') }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted } from 'vue'
    import { storeToRefs } from 'pinia'

    // Components
    import GameBoard from '~/modules/game-field/components/game-board/GameBoard.vue'
    import FooterBlock from '~/modules/footer-panel/components/footer-block/FooterBlock.vue'
    import HeaderBlock from '~/modules/header-panel/components/header-block/HeaderBlock.vue'

    // Stores
    import { useGameFieldStore } from '~/modules/game-field/store/game-field.store'

    // Composables
    import { useGameViewportScale } from '~/shared/composables/utils/useGameViewportScale'
    import { useOrientationLock } from '~/shared/composables/utils/useOrientationLock'

    // Bindings
    const gameFieldStore = useGameFieldStore()
    const { board, isSpinning } = storeToRefs(gameFieldStore)

    // State
    const { isLandscape } = useOrientationLock()
    const { viewportRef, gameRef, scaleStyle } = useGameViewportScale()

    // Methods
    const spin = () => gameFieldStore.spin()

    // Hooks
    onMounted(() => {
        gameFieldStore.initBoard()
    })
</script>

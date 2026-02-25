<template>
    <div class="flex h-full w-full items-center justify-center">
        <SvgShine class="absolute inset-0 h-full w-full -translate-y-[35%] translate-x-[10%] scale-[2]" />

        <div class="glow-ellipse pointer-events-none absolute left-0 right-0 top-[42%] mx-auto h-[55%] w-[70%] rounded-[50%] opacity-[0.7]" />

        <img :src="blueButtonImage" alt="blue button image" class="absolute left-0 right-0 top-[12%] mx-auto h-[33%] w-[75%] object-contain" />
        <p class="absolute left-0 right-0 top-[16%] mx-auto w-max font-darumadrop text-game-2xl text-white [text-shadow:0_4px_1.9px_rgba(0,0,0,0.45)]">
            YOU WIN!
        </p>
        <p
            class="jackpot-text-stroke w-[80%] scale-110 pt-[5%] text-center font-darumadrop text-game-5xl text-white [text-shadow:0_4px_1.9px_rgba(0,0,0,0.45)]"
        >
            {{ text }}
        </p>
    </div>
</template>

<script setup lang="ts">
    import type { HeaderSignboardText } from '~/modules/panels/header/types/header-signboard.types'

    import SvgShine from '../svg-shine/SvgShine.vue'
    import blueButtonImage from '~/assets/images/header/blue-button.png'

    interface BonusGameContentProps {
        text: HeaderSignboardText
    }

    defineProps<BonusGameContentProps>()
</script>

<style scoped>
    .jackpot-text-stroke {
        -webkit-text-stroke: 3px rgba(30, 52, 131, 1);
        paint-order: stroke fill;
    }

    .glow-ellipse {
        background: radial-gradient(ellipse at center, #fbff8c 0%, rgba(255, 219, 75, 0) 100%);
        filter: blur(18px);
    }
</style>

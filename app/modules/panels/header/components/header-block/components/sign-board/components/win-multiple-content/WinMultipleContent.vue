<template>
    <div class="flex h-full w-full items-center justify-center">
        <SvgShine class="absolute inset-0 h-full w-full -translate-y-[35%] translate-x-[10%] scale-[2]" />

        <img :src="starImage" alt="star image" class="absolute left-[5%] top-[48%] h-[25%] w-[25%] object-contain" />
        <p class="w-[50%] scale-110 pt-[5%] text-center font-darumadrop text-game-3xl text-white [text-shadow:0_4px_1.9px_rgba(0,0,0,0.45)]">
            {{ text }}
        </p>
        <img :src="starImage" alt="star image" class="absolute right-[3%] top-[48%] h-[25%] w-[25%] object-contain" />
    </div>
</template>

<script setup lang="ts">
    import starImage from '~/assets/images/header/star.png'
    import type { HeaderSignboardText } from '~/modules/panels/header/types/header-signboard.types'

    import SvgShine from '../svg-shine/SvgShine.vue'

    interface BonusGameContentProps {
        text: HeaderSignboardText
    }

    defineProps<BonusGameContentProps>()
</script>

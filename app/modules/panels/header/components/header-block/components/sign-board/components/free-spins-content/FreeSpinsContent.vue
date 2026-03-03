<template>
    <div class="flex h-full w-full items-center justify-center">
        <img :src="lightningImage" alt="lightning image" class="absolute left-[5%] top-[38%] h-[42%] w-[25%] object-contain" />
        <p class="w-[50%] scale-110 pt-[5%] text-center font-darumadrop text-game-3xl text-white [text-shadow:0_4px_1.9px_rgba(0,0,0,0.45)]">
            {{ text }}
        </p>
        <img :src="lightningImage" alt="lightning image" class="absolute right-[5%] top-[38%] h-[42%] w-[25%] -scale-x-100 object-contain" />
    </div>
</template>

<script setup lang="ts">
    import lightningImage from '~/assets/images/header/lightning.png'
    import type { HeaderSignboardText } from '~/modules/panels/header/types/header-signboard.types'

    interface BonusGameContentProps {
        text: HeaderSignboardText
    }

    defineProps<BonusGameContentProps>()
</script>

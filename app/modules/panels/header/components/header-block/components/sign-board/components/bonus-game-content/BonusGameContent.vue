<template>
    <div class="flex h-full w-full items-center justify-center">
        <SvgShine class="absolute inset-0 h-full w-full -translate-y-[35%] translate-x-[10%] scale-[2]" />

        <img :src="bonusSwordsImage" alt="bonus sword image" class="absolute left-[5%] top-[30%] h-[62%] w-[30%] -scale-x-100 object-contain" />
        <p class="w-[40%] scale-110 pt-[7%] text-center font-darumadrop text-game-4xl text-white [text-shadow:0_4px_1.9px_rgba(0,0,0,0.45)]">
            {{ text }}
        </p>
        <img :src="bonusSwordsImage" alt="bonus sword image" class="absolute right-[5%] top-[30%] h-[62%] w-[30%] object-contain" />
    </div>
</template>

<script setup lang="ts">
    import bonusSwordsImage from '~/assets/images/header/sword.png'
    import type { HeaderSignboardText } from '~/modules/panels/header/types/header-signboard.types'

    import SvgShine from '../svg-shine/SvgShine.vue'

    interface BonusGameContentProps {
        text: HeaderSignboardText
    }

    defineProps<BonusGameContentProps>()
</script>

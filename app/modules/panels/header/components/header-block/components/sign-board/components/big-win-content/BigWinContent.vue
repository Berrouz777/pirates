<template>
    <div class="flex h-full w-full items-center justify-center">
        <p class="w-[60%] pt-[5%] text-center font-darumadrop text-game-2xl text-white [text-shadow:0_4px_1.9px_rgba(0,0,0,0.45)]">
            {{ text }}
        </p>
    </div>
</template>

<script setup lang="ts">
    import type { HeaderSignboardText } from '~/modules/panels/header/types/header-signboard.types'

    interface BigWinContentProps {
        text: HeaderSignboardText
    }

    defineProps<BigWinContentProps>()
</script>

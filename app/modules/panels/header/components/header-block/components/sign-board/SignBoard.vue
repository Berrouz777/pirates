<template>
    <div class="absolute -top-[14%] bottom-0 left-0 right-0 m-auto h-full w-[95%] [perspective:1200px]">
        <div class="header-sign relative h-full w-full" :class="signBoardClassNames" :style="animationCssVars">
            <img :src="tableImage" alt="header image" class="h-full w-full object-contain" />
            <SvgShine v-if="hasShine" class="pointer-events-none absolute inset-0 h-full w-full -translate-y-[35%] translate-x-[10%] scale-[2]" />
            <div class="pointer-events-none absolute inset-0">
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, toRefs } from 'vue'

    import tableImage from '~/assets/images/header/top-table.png'
    import {
        SIGNBOARD_DOOR_SWING_DELAY_MS,
        SIGNBOARD_DOOR_SWING_DURATION_MS,
        SIGNBOARD_DROP_OUT_DURATION_MS
    } from '~/modules/panels/header/constants/animation.constants'
    import type { HeaderSignboardAnimationState } from '~/modules/panels/header/types/header-signboard.types'
    import SvgShine from './components/svg-shine/SvgShine.vue'

    interface HeaderSignboardProps {
        animationState: HeaderSignboardAnimationState
        hasShine: boolean
    }

    const props = defineProps<HeaderSignboardProps>()
    const { hasShine } = toRefs(props)

    const signBoardClassNames = computed(() => ({
        'header-sign--entering': props.animationState === 'entering',
        'header-sign--dropping': props.animationState === 'dropping'
    }))

    const animationCssVars = {
        '--header-sign-door-swing-duration': `${SIGNBOARD_DOOR_SWING_DURATION_MS}ms`,
        '--header-sign-door-swing-delay': `${SIGNBOARD_DOOR_SWING_DELAY_MS}ms`,
        '--header-sign-drop-out-duration': `${SIGNBOARD_DROP_OUT_DURATION_MS}ms`
    }
</script>

<style scoped>
    .header-sign {
        transform-origin: top center;
    }

    .header-sign--entering {
        animation: door-swing var(--header-sign-door-swing-duration) cubic-bezier(0.25, 1.1, 0.4, 1) var(--header-sign-door-swing-delay) both;
    }

    .header-sign--dropping {
        animation: drop-out-down var(--header-sign-drop-out-duration) cubic-bezier(0.45, 0, 0.75, 0.15) both;
    }

    @keyframes door-swing {
        0% {
            transform: translateY(-40%) rotateX(-80deg);
            opacity: 0;
        }

        25% {
            transform: translateY(0) rotateX(35deg);
            opacity: 1;
        }

        45% {
            transform: translateY(0) rotateX(-20deg);
        }

        65% {
            transform: translateY(0) rotateX(10deg);
        }

        85% {
            transform: translateY(0) rotateX(-4deg);
        }

        100% {
            transform: translateY(0) rotateX(0deg);
        }
    }

    @keyframes drop-out-down {
        0% {
            transform: translateY(0);
        }

        100% {
            transform: translateY(-150%);
        }
    }
</style>

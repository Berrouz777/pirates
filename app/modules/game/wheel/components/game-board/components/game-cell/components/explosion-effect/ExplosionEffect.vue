<template>
    <div class="explosion pointer-events-none absolute left-1/2 top-1/2 h-[230%] w-[230%] -translate-x-1/2 -translate-y-1/2" :style="explosionStyle">
        <img v-for="(src, index) in frameSrcs" :key="index" :src="src" alt="explosion image" class="explosion-frame" :class="`explosion-frame--${index}`" />
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    import { EXPLOSION_DELAY_MS, EXPLOSION_DURATION_MS } from '../../../../../../constants/animation.constants'

    import frame1 from '~/assets/images/explosion/explosion-1.png'
    import frame2 from '~/assets/images/explosion/explosion-2.png'
    import frame3 from '~/assets/images/explosion/explosion-3.png'
    import frame4 from '~/assets/images/explosion/explosion-4.png'
    import frame5 from '~/assets/images/explosion/explosion-5.png'
    import frame6 from '~/assets/images/explosion/explosion-6.png'

    const frameSrcs = [frame1, frame2, frame3, frame4, frame5, frame6]

    const explosionStyle = computed(() => ({
        '--explosion-delay-ms': `${EXPLOSION_DELAY_MS}ms`,
        '--explosion-duration': `${EXPLOSION_DURATION_MS}ms`
    }))
</script>

<style scoped>
    .explosion {
        z-index: 11;
        overflow: hidden;
    }

    .explosion-frame {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        opacity: 0;
        animation-duration: var(--explosion-duration, 400ms);
        animation-delay: var(--explosion-delay-ms, 0ms);
        animation-timing-function: steps(6);
        animation-fill-mode: forwards;
    }

    .explosion-frame--0 {
        animation-name: explosion-frame-0;
    }
    .explosion-frame--1 {
        animation-name: explosion-frame-1;
    }
    .explosion-frame--2 {
        animation-name: explosion-frame-2;
    }
    .explosion-frame--3 {
        animation-name: explosion-frame-3;
    }
    .explosion-frame--4 {
        animation-name: explosion-frame-4;
    }
    .explosion-frame--5 {
        animation-name: explosion-frame-5;
    }

    @keyframes explosion-frame-0 {
        0% {
            opacity: 1;
        }
        16.667% {
            opacity: 0;
        }
        100% {
            opacity: 0;
        }
    }

    @keyframes explosion-frame-1 {
        0% {
            opacity: 0;
        }
        16.667% {
            opacity: 1;
        }
        33.333% {
            opacity: 0;
        }
        100% {
            opacity: 0;
        }
    }

    @keyframes explosion-frame-2 {
        0% {
            opacity: 0;
        }
        33.333% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
        100% {
            opacity: 0;
        }
    }

    @keyframes explosion-frame-3 {
        0% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        66.667% {
            opacity: 0;
        }
        100% {
            opacity: 0;
        }
    }

    @keyframes explosion-frame-4 {
        0% {
            opacity: 0;
        }
        66.667% {
            opacity: 1;
        }
        83.333% {
            opacity: 0;
        }
        100% {
            opacity: 0;
        }
    }

    @keyframes explosion-frame-5 {
        0% {
            opacity: 0;
        }
        83.333% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }
</style>

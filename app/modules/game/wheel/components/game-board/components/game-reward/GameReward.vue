<template>
    <div class="pointer-events-none absolute inset-0 z-20 overflow-visible">
        <div v-for="reward in positionedRewards" :key="reward.id" class="absolute z-20" :style="reward.style">
            <div class="reward-amount-wrapper absolute left-0 top-0 z-[2]" :class="{ 'reward-amount-wrapper--flying': reward.stage === 'flying' }">
                <div class="reward-appear-layer relative">
                    <GameRewardBurst class="reward-burst absolute left-1/2 top-1/2 z-[1]" :class="{ 'reward-burst--fading': reward.stage !== 'appearing' }" />
                    <GameRewardAmount class="reward-amount relative z-[2] mx-auto block pt-[12%]" :amount="reward.amount" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { RewardAnimationMeta } from '../../../../types'

    import GameRewardAmount from './components/GameRewardAmount.vue'
    import GameRewardBurst from './components/GameRewardBurst.vue'
    import { useRewardPositioning } from './composables/useRewardPositioning'

    export interface GameRewardProps {
        rewards: RewardAnimationMeta[]
        boardElement: HTMLElement | null
    }

    const props = defineProps<GameRewardProps>()
    const { positionedRewards } = useRewardPositioning({
        rewards: () => props.rewards,
        boardElement: () => props.boardElement
    })
</script>

<style scoped>
    .reward-amount-wrapper {
        transform: translate(-50%, -50%) scale(1);
        transition: transform var(--reward-fly-duration) ease-in;
        will-change: transform;
    }

    .reward-amount-wrapper--flying {
        transform: translate(calc(-50% + var(--reward-fly-x)), calc(-50% + var(--reward-fly-y))) scale(0.2);
    }

    .reward-appear-layer {
        width: var(--reward-amount-width);
        transform: scale(0);
        opacity: 0;
        transform-origin: center center;
        animation: reward-appear var(--reward-appear-duration) ease-out var(--reward-start-delay) both;
        will-change: transform, opacity;
    }

    .reward-burst {
        width: var(--reward-size);
        transform: translate(-50%, -50%);
        opacity: 1;
        transition: opacity var(--reward-burst-fade-duration) linear;
    }

    .reward-burst--fading {
        opacity: 0;
    }

    .reward-amount {
        width: calc(var(--reward-amount-width) * 0.5);
    }

    @keyframes reward-appear {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
</style>

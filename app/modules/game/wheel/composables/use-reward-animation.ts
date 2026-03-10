import type { Ref } from 'vue'

import { REWARD_BASE_FADE_MS, REWARD_FADE_START_DELAY_MS, REWARD_FLY_MS } from '../constants'
import type { AnimationMeta } from '../types'

interface UseRewardAnimationParams {
    animationMeta: Ref<AnimationMeta>
    sleep: (duration: number) => Promise<void>
}

interface TriggerRewardAnimationOptions {
    amount: number
    onFlyingStart?: () => void
}

export const useRewardAnimation = ({ animationMeta, sleep }: UseRewardAnimationParams) => {
    let rewardId = 0

    const triggerRewardAnimation = ({ amount, onFlyingStart }: TriggerRewardAnimationOptions) => {
        const currentId = rewardId++

        animationMeta.value = {
            ...animationMeta.value,
            rewardAnimations: [...animationMeta.value.rewardAnimations, { id: currentId, stage: 'appearing', amount }]
        }

        void (async () => {
            await sleep(REWARD_FADE_START_DELAY_MS)
            animationMeta.value = {
                ...animationMeta.value,
                rewardAnimations: animationMeta.value.rewardAnimations.map((reward) => (reward.id === currentId ? { ...reward, stage: 'fading' } : reward))
            }

            await sleep(REWARD_BASE_FADE_MS)
            animationMeta.value = {
                ...animationMeta.value,
                rewardAnimations: animationMeta.value.rewardAnimations.map((reward) => (reward.id === currentId ? { ...reward, stage: 'flying' } : reward))
            }
            onFlyingStart?.()

            await sleep(REWARD_FLY_MS)
            animationMeta.value = {
                ...animationMeta.value,
                rewardAnimations: animationMeta.value.rewardAnimations.filter((reward) => reward.id !== currentId)
            }
        })()
    }

    return {
        triggerRewardAnimation
    }
}

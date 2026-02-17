import { computed } from 'vue'
import type { CSSProperties } from 'vue'

import { REWARD_APPEAR_MS, REWARD_BASE_FADE_MS, REWARD_FLY_MS, REWARD_START_DELAY_MS } from '../../../../../constants'
import type { RewardAnimationMeta, RewardAnimationStage } from '../../../../../types'

interface UseRewardPositioningParams {
    rewards: () => RewardAnimationMeta[]
    boardElement: () => HTMLElement | null
}

export interface PositionedReward {
    id: number
    stage: RewardAnimationStage
    style: CSSProperties
}

export const useRewardPositioning = ({ rewards, boardElement }: UseRewardPositioningParams) => {
    const positionedRewards = computed<PositionedReward[]>(() => {
        const board = boardElement()
        const rewardsList = rewards()

        if (!board || rewardsList.length === 0) {
            return []
        }

        const boardRect = board.getBoundingClientRect()
        const gameGrid = board.querySelector<HTMLElement>('[data-game-grid]')
        const winTarget = board.querySelector<HTMLElement>('[data-win-target]')

        if (!gameGrid || !winTarget) {
            return []
        }

        const gridRect = gameGrid.getBoundingClientRect()
        const winRect = winTarget.getBoundingClientRect()
        const sourceX = gridRect.left - boardRect.left + gridRect.width / 2
        const sourceY = gridRect.top - boardRect.top + gridRect.height / 2
        const targetX = winRect.left - boardRect.left + winRect.width / 2
        const targetY = winRect.top - boardRect.top + winRect.height / 2
        const flyX = targetX - sourceX
        const flyY = targetY - sourceY

        // Подложка (burst) — шире сетки, почти на всю ширину игры
        const rewardSize = Math.max(gridRect.width * 1.4, 390)
        // Ширина суммы — от ширины сетки, независимо от размера подложки
        const amountWidth = gridRect.width

        return rewardsList.map((reward) => ({
            id: reward.id,
            stage: reward.stage,
            style: {
                'left': `${sourceX}px`,
                'top': `${sourceY}px`,
                '--reward-fly-x': `${flyX}px`,
                '--reward-fly-y': `${flyY}px`,
                '--reward-size': `${rewardSize}px`,
                '--reward-amount-width': `${amountWidth}px`,
                '--reward-appear-duration': `${REWARD_APPEAR_MS}ms`,
                '--reward-burst-fade-duration': `${REWARD_BASE_FADE_MS}ms`,
                '--reward-fly-duration': `${REWARD_FLY_MS}ms`,
                '--reward-start-delay': `${REWARD_START_DELAY_MS}ms`
            } as CSSProperties
        }))
    })

    return { positionedRewards }
}

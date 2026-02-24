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

interface RelativePosition {
    x: number
    y: number
}

const getCenterRelativeToAncestor = (element: HTMLElement, ancestor: HTMLElement): RelativePosition | null => {
    let current: HTMLElement | null = element
    let x = element.offsetWidth / 2
    let y = element.offsetHeight / 2

    while (current && current !== ancestor) {
        x += current.offsetLeft
        y += current.offsetTop
        current = current.offsetParent as HTMLElement | null
    }

    if (current !== ancestor) {
        return null
    }

    return { x, y }
}

export const useRewardPositioning = ({ rewards, boardElement }: UseRewardPositioningParams) => {
    const positionedRewards = computed<PositionedReward[]>(() => {
        const board = boardElement()
        const rewardsList = rewards()

        if (!board || rewardsList.length === 0) {
            return []
        }

        const gameGrid = board.querySelector<HTMLElement>('[data-game-grid]')
        const winTarget = board.querySelector<HTMLElement>('[data-win-target]')

        if (!gameGrid || !winTarget) {
            return []
        }

        const sourceCenter = getCenterRelativeToAncestor(gameGrid, board)
        const targetCenter = getCenterRelativeToAncestor(winTarget, board)
        if (!sourceCenter || !targetCenter) {
            return []
        }

        const sourceX = sourceCenter.x
        const sourceY = sourceCenter.y
        const targetX = targetCenter.x
        const targetY = targetCenter.y
        const flyX = targetX - sourceX
        const flyY = targetY - sourceY

        // Подложка (burst) — шире сетки, почти на всю ширину игры
        const rewardSize = Math.max(gameGrid.offsetWidth * 1.4, 390)
        // Ширина суммы — от ширины сетки, независимо от размера подложки
        const amountWidth = gameGrid.offsetWidth

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

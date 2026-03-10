export type RewardAnimationStage = 'appearing' | 'fading' | 'flying'

export interface RewardAnimationMeta {
    id: number
    stage: RewardAnimationStage
    amount: number
}

export interface BonusFlightAnimationMeta {
    id: number
    sourceIndex: number
    startDelayMs: number
}

export interface AnimationMeta {
    removingIndices: number[]
    spawnIndices: number[]
    fallOffsetsByIndex: Record<number, number>
    rewardAnimations: RewardAnimationMeta[]
    bonusHoverIndices: number[]
    hiddenBonusIndices: number[]
    bonusFlightAnimations: BonusFlightAnimationMeta[]
}

export type RewardAnimationStage = 'appearing' | 'fading' | 'flying'

export interface RewardAnimationMeta {
    id: number
    stage: RewardAnimationStage
}

export interface AnimationMeta {
    removingIndices: number[]
    spawnIndices: number[]
    fallOffsetsByIndex: Record<number, number>
    rewardAnimations: RewardAnimationMeta[]
}

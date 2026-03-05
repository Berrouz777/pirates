import { EXPLOSION_DELAY_MS, EXPLOSION_DURATION_MS } from './animation.constants'

// Старт награды на 2-3 фазе взрыва (между ~33% и ~50%)
export const REWARD_START_DELAY_MS = EXPLOSION_DELAY_MS + EXPLOSION_DURATION_MS * 0.33
export const REWARD_APPEAR_MS = 400
export const REWARD_BASE_FADE_MS = 200
export const REWARD_FLY_MS = 200
export const REWARD_CHAIN_OVERLAP_RATIO = 0

export const REWARD_FADE_START_DELAY_MS = REWARD_START_DELAY_MS + REWARD_APPEAR_MS
export const REWARD_FLY_START_DELAY_MS = REWARD_FADE_START_DELAY_MS + REWARD_BASE_FADE_MS

export const getRewardOverlapMs = (overlapRatio: number = REWARD_CHAIN_OVERLAP_RATIO): number =>
    REWARD_START_DELAY_MS + REWARD_APPEAR_MS + REWARD_BASE_FADE_MS + REWARD_FLY_MS * overlapRatio

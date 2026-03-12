import type { RewardElementType } from './pirates-mock-state.types'

export const MAX_GROUP_SIZE_FOR_MULTIPLIER = 17

export const ELEMENT_MULTIPLIER_BY_GROUP_SIZE: Record<RewardElementType, Record<number, number>> = {
    shield: {
        13: 1.15,
        14: 1.5,
        15: 2.5,
        16: 5,
        17: 15
    },
    sword: {
        13: 0.5,
        14: 1.15,
        15: 1.5,
        16: 2.5,
        17: 5
    },
    tankard: {
        13: 0.25,
        14: 0.5,
        15: 1.15,
        16: 1.5,
        17: 2.5
    },
    wheel: {
        14: 0.25,
        15: 0.5,
        16: 1.15,
        17: 1.5
    },
    musketoon: {
        14: 0.25,
        15: 0.5,
        16: 1.15,
        17: 1.5
    },
    cannon: {
        15: 0.25,
        16: 0.5,
        17: 1.15
    },
    keg: {
        16: 0.25,
        17: 0.5
    },
    bomb: {
        16: 0.25,
        17: 0.5
    }
}

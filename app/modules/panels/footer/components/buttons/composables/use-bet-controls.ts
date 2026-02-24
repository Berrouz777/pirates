import type { Ref } from 'vue'

import { MAX_BET, MIN_BET, BET_STEP } from '~/modules/game/wheel'

export interface UseBetControlsStore {
    bet: Ref<number>
}

export const useBetControls = (store: UseBetControlsStore) => {
    const decreaseBet = () => {
        if (store.bet.value > MIN_BET) {
            store.bet.value -= BET_STEP
        }
    }

    const increaseBet = () => {
        if (store.bet.value < MAX_BET) {
            store.bet.value = Math.min(store.bet.value + BET_STEP, MAX_BET)
        }
    }

    const setBetToMin = () => {
        store.bet.value = MIN_BET
    }

    const setBetToMax = () => {
        store.bet.value = MAX_BET
    }

    return {
        decreaseBet,
        increaseBet,
        setBetToMin,
        setBetToMax,
        minBet: MIN_BET,
        maxBet: MAX_BET
    }
}

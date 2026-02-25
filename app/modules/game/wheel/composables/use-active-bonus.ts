import type { Ref } from 'vue'
import type { ActiveBonusEffect } from '../types'

interface UseActiveBonusOptions {
    activeBonusEffect: Ref<ActiveBonusEffect | null>
}

export const useActiveBonus = ({ activeBonusEffect }: UseActiveBonusOptions) => {
    const hasFreeSpinAvailable = () => {
        return activeBonusEffect.value?.prizeType === 'freespins' && activeBonusEffect.value.remainingSpins > 0
    }

    const consumeActiveBonusSpin = () => {
        if (!activeBonusEffect.value || activeBonusEffect.value.remainingSpins <= 0) {
            return
        }

        activeBonusEffect.value = {
            ...activeBonusEffect.value,
            remainingSpins: activeBonusEffect.value.remainingSpins - 1
        }

        if (activeBonusEffect.value.remainingSpins <= 0) {
            activeBonusEffect.value = null
        }
    }

    const getWinRewardMultiplier = () => {
        if (activeBonusEffect.value?.prizeType !== 'multiple') {
            return 1
        }

        return activeBonusEffect.value.multipleValue ?? 1
    }

    return {
        hasFreeSpinAvailable,
        consumeActiveBonusSpin,
        getWinRewardMultiplier
    }
}

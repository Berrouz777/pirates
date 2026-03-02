import type { Ref } from 'vue'
import type { ActiveBonusEffect } from '../types'

interface UseActiveBonusOptions {
    activeBonusEffect: Ref<ActiveBonusEffect | null>
}

export const useActiveBonus = ({ activeBonusEffect }: UseActiveBonusOptions) => {
    const hasFreeSpinAvailable = () => {
        return activeBonusEffect.value?.prizeType === 'freespins' && activeBonusEffect.value.remainingSpins > 0
    }

    return { hasFreeSpinAvailable }
}

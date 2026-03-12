import type { ActiveBonusEffect, ElementType } from '../../app/modules/game/wheel'

export interface MockState {
    balance: number
    bonusProgress: number
    activeBonusEffect: ActiveBonusEffect | null
    spinCounter: number
    betSumToBonus: number
    paidSpinsToBonus: number
}

export type RewardElementType = Exclude<ElementType, 'bonus-game' | 'bonus-scatter'>

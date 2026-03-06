import type { CellValue } from './board.types'
import type { ElementType } from './element.types'
import type { ActiveBonusEffect, BonusRouletteResult } from './win.types'

export type GamePhase = 'idle' | 'spinningOut' | 'spawning' | 'clearing' | 'falling' | 'filling'

export interface SpinRequest {
    bet: number
}

// Одна группа которая взрывается в данном дропе.
// rewardAmount — выигрыш за эту конкретную группу в деньгах (ставка * коэффициент),
// нужен для поэтапного показа GameReward после каждой группы.
export interface SpinExplodingGroup {
    type: ElementType
    count: number
    rewardAmount: number
}

// Один "дроп" — либо полное начальное поле (drops[0], 49 элементов),
// либо элементы которые довыпадают после взрыва (drops[1..N]).
// counts: сколько каких элементов содержится в этом дропе.
// explodingGroups: какие группы взрываются (пустой массив = взрывов нет).
// win: итоговый выигрыш за взрывы этого дропа в деньгах,
//      фронт отображает его после анимации взрывов, что бы не считать самостоятельно.
export interface SpinDrop {
    counts: Partial<Record<Exclude<CellValue, null>, number>>
    explodingGroups: SpinExplodingGroup[]
    win: number
    bonusProgress: number
}

// Ответ на один спин.
// win: суммарный выигрыш за спин от взрывов (сумма win по всем дропам) в деньгах.
//      cashAmount из бонусной рулетки приходит отдельно в bonusRouletteResult.cashAmount.
// balance: баланс после спина.
// averageBetToBonus: среднее количество ставок до следующего бонуса (для отображения в UI).
// bonusTriggered: был ли активирован бонус в этом спине.
// bonusRouletteResult: результат рулетки бонуса (null если бонус не был активирован).
// activeBonusEffect: текущий активный бонусный эффект (фриспины или мультипликатор), null если нет.
export interface SpinScenarioResponse {
    spinId: string
    drops: SpinDrop[]
    win: number
    balance: number
    averageBetToBonus: number
    bonusTriggered: boolean
    bonusRouletteResult: BonusRouletteResult | null
    activeBonusEffect: ActiveBonusEffect | null
}

export interface InitGameResponse {
    board: CellValue[]
    balance: number
    bet: number
    bonusProgress: number
    activeBonusEffect: ActiveBonusEffect | null
}

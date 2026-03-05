import { computed } from 'vue'
import type { CSSProperties } from 'vue'

import { BONUS_FLIGHT_DURATION_MS } from '../../../../../constants'
import type { BonusFlightAnimationMeta } from '../../../../../types'

export interface PositionedBonusFlight {
    id: number
    style: CSSProperties
}

interface UseBonusFlightPositioningParams {
    flights: () => BonusFlightAnimationMeta[]
    boardElement: () => HTMLElement | null
}

export const useBonusFlightPositioning = ({ flights, boardElement }: UseBonusFlightPositioningParams) => {
    const renderedFlights = computed<PositionedBonusFlight[]>(() => {
        const board = boardElement()
        const currentFlights = flights()
        const target = document.querySelector<HTMLElement>('[data-bonus-target]')

        if (!board || !target || !currentFlights.length) {
            return []
        }

        const targetRect = target.getBoundingClientRect()
        const targetCenterX = targetRect.left + targetRect.width / 2
        const targetCenterY = targetRect.top + targetRect.height / 2

        return currentFlights
            .map((flight) => {
                const sourceElement = board.querySelector<HTMLElement>(`[data-bonus-source-index="${flight.sourceIndex}"] .bonus-element-wrapper`)
                if (!sourceElement) {
                    return null
                }

                const sourceRect = sourceElement.getBoundingClientRect()
                const sourceCenterX = sourceRect.left + sourceRect.width / 2
                const sourceCenterY = sourceRect.top + sourceRect.height / 2
                const flyX = targetCenterX - sourceCenterX
                const flyY = targetCenterY - sourceCenterY

                return {
                    id: flight.id,
                    style: {
                        'left': `${sourceCenterX}px`,
                        'top': `${sourceCenterY}px`,
                        'width': `${sourceRect.width}px`,
                        'height': `${sourceRect.height}px`,
                        '--bonus-fly-x': `${flyX}px`,
                        '--bonus-fly-y': `${flyY}px`,
                        '--bonus-fly-duration': `${BONUS_FLIGHT_DURATION_MS}ms`,
                        '--bonus-fly-delay': `${flight.startDelayMs}ms`
                    } as CSSProperties
                }
            })
            .filter((flight): flight is PositionedBonusFlight => Boolean(flight))
    })

    return { renderedFlights }
}

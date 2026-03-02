import type { SpinRequest } from '~/modules/game/wheel/types'

import { usePiratesMockState } from '../../composables/usePiratesMockState'

export default defineEventHandler(async (event) => {
    const body = await readBody<Partial<SpinRequest>>(event)
    const bet = Number(body?.bet)

    if (!Number.isFinite(bet) || bet <= 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid bet value'
        })
    }

    return usePiratesMockState().getNextSpinScenario(bet)
})

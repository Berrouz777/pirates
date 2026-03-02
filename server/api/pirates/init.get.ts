import { usePiratesMockState } from '../../composables/usePiratesMockState'

export default defineEventHandler(() => {
    return usePiratesMockState().getInitState()
})

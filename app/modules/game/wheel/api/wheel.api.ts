import type { InitGameResponse, SpinRequest, SpinScenarioResponse } from '../types'

export const useWheelApi = () => {
    const init = (): Promise<InitGameResponse> => {
        return $fetch<InitGameResponse>('/api/pirates/init')
    }

    const spin = async (body: SpinRequest): Promise<SpinScenarioResponse> => {
        console.log('[spin] request →', body)
        const response = await $fetch<SpinScenarioResponse>('/api/pirates/spin', {
            method: 'POST',
            body
        })
        console.log('[spin] response ←', JSON.parse(JSON.stringify(response)))
        return response
    }

    return {
        init,
        spin
    }
}

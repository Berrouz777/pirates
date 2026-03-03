import type { InitGameResponse, SpinRequest, SpinScenarioResponse } from '../types'
import { useApi } from '~/shared/composables/utils/useApi'

export const useWheelApi = () => {
    const { makeRequest } = useApi()

    const init = (): Promise<InitGameResponse> => {
        return makeRequest<InitGameResponse>('/api/pirates/init', {
            throwError: true,
            showErrorToast: true
        })
    }

    const spin = (body: SpinRequest): Promise<SpinScenarioResponse> => {
        return makeRequest<SpinScenarioResponse>('/api/pirates/spin', {
            fetchOptions: {
                method: 'POST',
                body
            },
            throwError: true,
            showErrorToast: true
        })
    }

    return {
        init,
        spin
    }
}

import type { NitroFetchOptions } from 'nitropack'

export type MakeRequestOptions<T> = {
    transform?: (data: unknown) => T
    onError?: (error: unknown) => T | undefined
    throwError?: boolean
    fetchOptions?: NitroFetchOptions<string>
    showErrorToast?: boolean
}

export const useApi = () => {
    const toast = useToast()
    const config = useRuntimeConfig()

    const makeRequest = async <T>(url: string, options: MakeRequestOptions<T> = {}): Promise<T> => {
        try {
            const response = await $fetch<unknown>(url, {
                baseURL: config.public.apiBase || undefined,
                ...options.fetchOptions
            })

            return options.transform ? options.transform(response) : (response as T)
        } catch (error) {
            if (options.showErrorToast) {
                toast.error({
                    title: 'Error',
                    message: 'Something went wrong'
                })
            }

            if (options.onError) {
                const fallback = options.onError(error)
                if (fallback !== undefined) {
                    return fallback as T
                }
            }

            if (options.throwError) {
                throw error
            }

            return null as unknown as T
        }
    }

    return {
        makeRequest
    }
}

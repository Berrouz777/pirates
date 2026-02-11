import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDevice } from '~/shared/composables/utils/useDevice'

export const useOrientationLock = () => {
    // State
    const isLandscape = ref<boolean>(false)

    // Bindings
    const { isMobileDevice } = useDevice()

    // Helpers
    const lockScroll = () => {
        if (typeof document === 'undefined') return

        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'
    }

    const unlockScroll = () => {
        if (typeof document === 'undefined') return

        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
    }

    const updateOrientation = () => {
        if (typeof window === 'undefined') return

        isLandscape.value = window.innerWidth > window.innerHeight
    }

    const initOrientationLock = () => {
        if (!isMobileDevice.value) return

        // Пытаемся зафиксировать ориентацию экрана в портретной
        const orientation = (screen as { orientation?: { lock?: (type: 'portrait-primary') => Promise<void> } }).orientation

        if (orientation?.lock) {
            orientation.lock('portrait-primary').catch(() => {
                // Браузер не разрешил блокировку ориентации — игнорируем
            })
        }

        updateOrientation()

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', updateOrientation)
        }
    }

    // Hooks
    onMounted(() => {
        initOrientationLock()
    })

    onBeforeUnmount(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', updateOrientation)
        }

        unlockScroll()
    })

    // Watchers
    watch(
        () => isLandscape.value,
        (value) => {
            if (!isMobileDevice.value) return

            if (value) {
                lockScroll()
            } else {
                unlockScroll()
            }
        }
    )

    return {
        isLandscape
    }
}

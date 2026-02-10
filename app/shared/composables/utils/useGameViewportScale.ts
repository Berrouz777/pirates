import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

export const useGameViewportScale = () => {
    // State
    const viewportRef = ref<HTMLElement | null>(null)
    const gameRef = ref<HTMLElement | null>(null)
    const scale = ref<number>(1)
    let resizeObserver: ResizeObserver | null = null

    // Computed
    const scaleStyle = computed<Record<string, string>>(() => ({
        transform: `scale(${scale.value})`
    }))

    // Methods
    const updateScale = (): void => {
        const viewportEl = viewportRef.value
        const gameEl = gameRef.value

        if (!viewportEl || !gameEl) return

        const availableWidth = viewportEl.clientWidth
        const availableHeight = viewportEl.clientHeight

        if (!availableWidth || !availableHeight) return

        const gameWidth = gameEl.offsetWidth
        const gameHeight = gameEl.offsetHeight

        if (!gameWidth || !gameHeight) return

        const widthScale = availableWidth / gameWidth
        const heightScale = availableHeight / gameHeight

        scale.value = Math.min(widthScale, heightScale, 1)
    }

    // Hooks
    onMounted(() => {
        nextTick(() => {
            updateScale()

            resizeObserver = new ResizeObserver(() => {
                updateScale()
            })

            if (viewportRef.value) {
                resizeObserver.observe(viewportRef.value)
            }

            if (gameRef.value) {
                resizeObserver.observe(gameRef.value)
            }
        })

        window.addEventListener('resize', updateScale)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('resize', updateScale)
        resizeObserver?.disconnect()
        resizeObserver = null
    })

    return {
        viewportRef,
        gameRef,
        scaleStyle
    }
}

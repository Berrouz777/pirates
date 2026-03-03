import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useWheelFlow, useWheelStore, type BonusRouletteResult } from '~/modules/game/wheel'
import { SIGNBOARD_DROP_OUT_DURATION_MS, SIGNBOARD_SWAP_DELAY_MS } from '~/modules/panels/header/constants/animation.constants'
import {
    formatFreespinsText,
    formatJackpotText,
    formatWinMultipleText,
    HEADER_SIGNBOARD_TEXTS
} from '~/modules/panels/header/constants/header-signboard.constants'
import type { HeaderSignboardAnimationState, HeaderSignboardVariant } from '~/modules/panels/header/types/header-signboard.types'
import {
    CHEST_APPEAR_MS,
    JACKPOT_SHOW_MS,
    ROULETTE_EXIT_MS,
    ROULETTE_SLIDE_MS,
    SIGN_TO_ROULETTE_DELAY_MS
} from '../components/roulette-block/constants/roulette.constants'
import { ROULETTE_CELLS } from '../components/roulette-block/constants/roulette-cells.constants'
import type { BonusFlowPhase } from '../types/header-bonus-flow.types'

const sleep = (durationMs: number) => new Promise((resolve) => setTimeout(resolve, durationMs))
const DEFAULT_VARIANT: HeaderSignboardVariant = 'BIG_WIN'

export const useHeaderBonusFlow = () => {
    const wheelStore = useWheelStore()
    const { activeBonusEffect, bonusIntroTrigger, bonusRouletteResult } = storeToRefs(wheelStore)
    const { applyBonusRouletteResult, prepareBonusRouletteResult, clearBonusRouletteResult } = useWheelFlow()

    const currentVariant = ref<HeaderSignboardVariant>(DEFAULT_VARIANT)
    const animationState = ref<HeaderSignboardAnimationState>('entering')
    const bonusFlowPhase = ref<BonusFlowPhase>('idle')
    const isTransitioning = ref<boolean>(false)
    const spinTrigger = ref<number>(0)
    const customText = ref<string | null>(null)
    let resolveSpin: (() => void) | null = null

    const isSignBoardVisible = computed(() => !['roulette-enter', 'spinning', 'roulette-exit'].includes(bonusFlowPhase.value))
    const isRouletteVisible = computed(() => ['sign-dropping', 'roulette-enter', 'spinning', 'roulette-exit'].includes(bonusFlowPhase.value))
    const isRouletteChestVisible = computed(() => ['sign-dropping', 'roulette-enter', 'spinning', 'roulette-exit'].includes(bonusFlowPhase.value))
    const isRoulettePanelVisible = computed(() => ['roulette-enter', 'spinning', 'roulette-exit'].includes(bonusFlowPhase.value))
    const isRouletteExiting = computed(() => bonusFlowPhase.value === 'roulette-exit')
    const currentText = computed(() => customText.value ?? HEADER_SIGNBOARD_TEXTS[currentVariant.value])
    const targetCellIndex = computed(() => {
        const key = bonusRouletteResult.value?.cellKey
        if (!key) return null
        const index = ROULETTE_CELLS.findIndex((cell) => cell.key === key)
        return index >= 0 ? index : null
    })
    const signContentTransitionName = computed(() => (bonusFlowPhase.value === 'bonus-label' ? 'sign-content-scale' : 'sign-content-none'))
    const signContentTransitionMode = computed<'out-in' | undefined>(() => (bonusFlowPhase.value === 'bonus-label' ? 'out-in' : undefined))

    const waitForSpinFinished = () =>
        new Promise<void>((resolve) => {
            resolveSpin = resolve
        })

    const handleSpinFinished = () => {
        resolveSpin?.()
        resolveSpin = null
    }

    const applyResultVariant = async (result: BonusRouletteResult) => {
        applyBonusRouletteResult()

        animationState.value = 'entering'
        bonusFlowPhase.value = 'result'

        if (result.prizeType === 'empty') {
            currentVariant.value = DEFAULT_VARIANT
            customText.value = null
            return
        }

        if (result.prizeType === 'freespins') {
            currentVariant.value = 'FREESPINS'
            customText.value = formatFreespinsText(result.freeSpinsCount ?? 0)
            return
        }

        if (result.prizeType === 'multiple') {
            currentVariant.value = 'WIN_MULTIPLE'
            customText.value = formatWinMultipleText(result.multipleValue ?? 1)
            return
        }

        currentVariant.value = 'WIN_JACKPOT'
        customText.value = formatJackpotText(result.cashAmount ?? 0)
        await sleep(JACKPOT_SHOW_MS)
        animationState.value = 'dropping'
        await sleep(SIGNBOARD_DROP_OUT_DURATION_MS + SIGNBOARD_SWAP_DELAY_MS)
        currentVariant.value = DEFAULT_VARIANT
        customText.value = null
        animationState.value = 'entering'
    }

    const runBonusFlow = async () => {
        isTransitioning.value = true
        wheelStore.isBonusAnimationPlaying = true
        try {
            customText.value = null
            currentVariant.value = 'BONUS_GAME'
            animationState.value = 'entering'
            bonusFlowPhase.value = 'bonus-label'

            const preparedResult = prepareBonusRouletteResult()
            if (!preparedResult) {
                wheelStore.isBonusMode = false
                return
            }

            await sleep(SIGN_TO_ROULETTE_DELAY_MS)
            animationState.value = 'dropping'
            bonusFlowPhase.value = 'sign-dropping'
            await sleep(SIGNBOARD_DROP_OUT_DURATION_MS + SIGNBOARD_SWAP_DELAY_MS)

            bonusFlowPhase.value = 'roulette-enter'
            spinTrigger.value += 1
            await Promise.all([
                waitForSpinFinished(),
                sleep(Math.max(0, CHEST_APPEAR_MS - (SIGNBOARD_DROP_OUT_DURATION_MS + SIGNBOARD_SWAP_DELAY_MS))),
                sleep(ROULETTE_SLIDE_MS)
            ])

            bonusFlowPhase.value = 'roulette-exit'
            await sleep(ROULETTE_EXIT_MS)

            await applyResultVariant(preparedResult)
            wheelStore.isBonusMode = false
            clearBonusRouletteResult()
        } finally {
            wheelStore.isBonusAnimationPlaying = false
            bonusFlowPhase.value = 'idle'
            isTransitioning.value = false
        }
    }

    watch(
        () => bonusIntroTrigger.value,
        async (nextTrigger, previousTrigger) => {
            if (nextTrigger <= 0 || nextTrigger === previousTrigger || isTransitioning.value) {
                return
            }

            await runBonusFlow()
        }
    )

    watch(
        () => activeBonusEffect.value,
        async (nextEffect, previousEffect) => {
            if (nextEffect?.prizeType === 'freespins') {
                if (!isTransitioning.value) {
                    currentVariant.value = 'FREESPINS'
                    customText.value = formatFreespinsText(nextEffect.remainingSpins)
                }
                return
            }

            if (nextEffect?.prizeType === 'multiple') {
                if (!isTransitioning.value) {
                    currentVariant.value = 'WIN_MULTIPLE'
                    customText.value = formatWinMultipleText(nextEffect.multipleValue)
                }
                return
            }

            const wasBonusMessage = previousEffect && ['FREESPINS', 'WIN_MULTIPLE'].includes(currentVariant.value)
            if (!wasBonusMessage || isTransitioning.value) {
                return
            }

            animationState.value = 'dropping'
            await sleep(SIGNBOARD_DROP_OUT_DURATION_MS + SIGNBOARD_SWAP_DELAY_MS)
            currentVariant.value = DEFAULT_VARIANT
            customText.value = null
            animationState.value = 'entering'
        }
    )

    return {
        currentVariant,
        animationState,
        isSignBoardVisible,
        isRouletteVisible,
        isRouletteChestVisible,
        isRoulettePanelVisible,
        isRouletteExiting,
        currentText,
        targetCellIndex,
        signContentTransitionName,
        signContentTransitionMode,
        spinTrigger,
        handleSpinFinished
    }
}

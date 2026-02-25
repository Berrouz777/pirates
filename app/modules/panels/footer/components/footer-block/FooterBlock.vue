<template>
    <div
        class="relative min-h-[21.9%] w-full bg-[#EDD3B2]"
        :class="{ 'pointer-events-none': props.isControlsLocked && !isAutoSpinning }"
        @click.capture="handleFooterButtonClick"
    >
        <img alt="footer image" :src="footerImage" class="pointer-events-none h-full w-full object-contain" />

        <BonusBlock class="absolute right-[0.5%] top-[1%] h-[45%] w-[93.4%]" />

        <div class="absolute left-[4.4%] top-[43%] flex h-[16%] w-[35.4%] items-center justify-between">
            <MinusPlusButton mode="minus" class="h-full w-[18.5%]" :disabled="isAtMinBet || props.isControlsLocked" @click="decreaseBet" />
            <p class="font-cuprum text-game-xl uppercase text-[#B6C7DB]">
                {{ bet }}
            </p>
            <MinusPlusButton mode="plus" class="h-full w-[18.5%]" :disabled="isAtMaxBet || props.isControlsLocked" @click="increaseBet" />
        </div>

        <MenuButton class="absolute right-[88.5%] top-[66%] h-[19.5%] w-[8.5%]" />

        <MinMaxButton mode="max" class="absolute right-[59%] top-[66%] h-[18%] w-[14%]" :disabled="isAtMaxBet || props.isControlsLocked" @click="setBetToMax" />
        <MinMaxButton
            mode="min"
            class="absolute right-[73.8%] top-[66%] h-[18%] w-[14%]"
            :disabled="isAtMinBet || props.isControlsLocked"
            @click="setBetToMin"
        />
        <SpinModeButton
            mode="auto"
            class="absolute right-[4%] top-[40%] h-[20%] w-[25%]"
            :disabled="(props.isControlsLocked && !isAutoSpinning) || (props.isSpinning && !isAutoSpinning && !isStoppingAutoSpin)"
            :pressed="isAutoSpinning"
            @click="handleAutoSpinClick"
        />
        <SpinModeButton
            mode="turbo"
            class="absolute right-[4%] top-[62.5%] h-[20%] w-[25%]"
            :disabled="(props.isControlsLocked && !isAutoSpinning) || (props.isSpinning && !isAutoSpinning && !isStoppingAutoSpin)"
        />
        <SpinButton
            class="absolute right-[31.5%] top-[40%] h-[44.5%] w-[25%]"
            :disabled="(props.isControlsLocked && !isAutoSpinning) || (props.isSpinning && !isAutoSpinning && !isStoppingAutoSpin)"
            @click="handleSpinClick"
        />
    </div>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import { storeToRefs } from 'pinia'
    import { useWheelStore } from '~/modules/game/wheel'

    import { useBetControls } from '../buttons/composables/use-bet-controls'

    import footerImage from '~/assets/images/footer/bottom.png'

    import BonusBlock from '../bonus-block/BonusBlock.vue'
    import SpinButton from '../buttons/components/spin-button/SpinButton.vue'
    import SpinModeButton from '../buttons/components/spin-mode-button/SpinModeButton.vue'
    import MinMaxButton from '../buttons/components/min-max-button/MinMaxButton.vue'
    import MinusPlusButton from '../buttons/components/minus-plus-button/MinusPlusButton.vue'
    import MenuButton from '../buttons/components/menu-button/MenuButton.vue'

    export interface FooterBlockProps {
        isSpinning: boolean
        isControlsLocked: boolean
    }

    const props = defineProps<FooterBlockProps>()

    const emit = defineEmits<{
        (event: 'spin'): void
    }>()

    const wheelStore = useWheelStore()
    const { bet, isAutoSpinning } = storeToRefs(wheelStore)
    const { decreaseBet, increaseBet, setBetToMin, setBetToMax, minBet, maxBet } = useBetControls({ bet })
    const { startAutoSpin, stopAutoSpin } = wheelStore
    const isStoppingAutoSpin = ref(false)

    const isAtMinBet = computed(() => bet.value <= minBet)
    const isAtMaxBet = computed(() => bet.value >= maxBet)

    watch(
        () => props.isSpinning,
        (isSpinningNow) => {
            if (!isSpinningNow) {
                isStoppingAutoSpin.value = false
            }
        }
    )

    const handleAutoSpinClick = async () => {
        if (props.isControlsLocked && !isAutoSpinning.value) {
            return
        }

        if (isAutoSpinning.value) {
            if (props.isSpinning) {
                isStoppingAutoSpin.value = true
            }
            stopAutoSpin()
            return
        }

        await startAutoSpin()
    }

    const handleSpinClick = () => {
        if (props.isControlsLocked && !isAutoSpinning.value) {
            return
        }

        if (isAutoSpinning.value) {
            stopAutoSpin()
            if (props.isSpinning) {
                isStoppingAutoSpin.value = true
                return
            }
        }

        emit('spin')
    }

    const handleFooterButtonClick = (event: MouseEvent) => {
        if (!isAutoSpinning.value) {
            return
        }

        const target = event.target as HTMLElement | null
        const button = target?.closest('button')
        if (!button) {
            return
        }

        const spinMode = button.dataset.spinMode
        if (spinMode === 'auto') {
            return
        }

        if (props.isSpinning) {
            isStoppingAutoSpin.value = true
        }
        stopAutoSpin()
    }
</script>

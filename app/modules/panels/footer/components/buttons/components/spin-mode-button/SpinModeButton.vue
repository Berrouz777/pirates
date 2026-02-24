<template>
    <button
        type="button"
        class="spin-mode-btn block cursor-pointer select-none disabled:cursor-not-allowed"
        :class="{ 'spin-mode-btn--pressed': props.pressed }"
        :data-spin-mode="props.mode"
        :disabled="props.disabled"
        @click="emit('click')"
    >
        <SvgAutoSpinButton v-if="props.mode === 'auto'" />
        <SvgTurboSpinButton v-else-if="props.mode === 'turbo'" />

        <p class="spin-mode-btn-text absolute inset-0 flex items-center justify-center pt-[5%] font-cuprum text-game-sm uppercase text-white">
            {{ $t(spinModeLabel) }}
        </p>
    </button>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import SvgAutoSpinButton from './components/svg-auto-spin-button/SvgAutoSpinButton.vue'
    import SvgTurboSpinButton from './components/svg-turbo-spin-button/SvgTurboSpinButton.vue'

    export interface SpinModeButtonProps {
        disabled: boolean
        mode: 'auto' | 'turbo'
        pressed?: boolean
    }

    const props = defineProps<SpinModeButtonProps>()

    const spinModeLabel = computed(() => (props.mode === 'auto' ? 'pirates.actions.autospin' : 'pirates.actions.turbospin'))

    const emit = defineEmits<{
        (event: 'click'): void
    }>()
</script>

<style scoped>
    .spin-mode-btn:not(:disabled):hover :deep(.spin-mode-btn-pressed),
    .spin-mode-btn:not(:disabled):active :deep(.spin-mode-btn-pressed) {
        opacity: 0.25;
        transition: opacity 100ms ease-out;
    }

    .spin-mode-btn--pressed :deep(.spin-mode-btn-pressed) {
        opacity: 0.5;
        transition: opacity 120ms ease-out;
    }

    .spin-mode-btn--pressed:not(:disabled):hover :deep(.spin-mode-btn-pressed),
    .spin-mode-btn--pressed:not(:disabled):active :deep(.spin-mode-btn-pressed) {
        opacity: 0.6;
    }

    .spin-mode-btn--pressed:not(:disabled):hover .spin-mode-btn-text,
    .spin-mode-btn--pressed:not(:disabled):active .spin-mode-btn-text {
        opacity: 0.8;
    }

    .spin-mode-btn:disabled :deep(.spin-mode-btn-pressed) {
        opacity: 0.45;
    }

    .spin-mode-btn:disabled .spin-mode-btn-text {
        opacity: 0.5;
    }
</style>

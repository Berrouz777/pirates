<template>
    <button
        type="button"
        class="footer-spin-btn block cursor-pointer select-none disabled:cursor-not-allowed"
        :disabled="props.disabled"
        @click="emit('click')"
    >
        <SvgSpinButton />

        <p class="footer-spin-btn-text absolute inset-0 flex items-center justify-center font-cuprum text-game-xl uppercase text-white hover:opacity-80">
            {{ $t('pirates.actions.spin') }}
        </p>
    </button>
</template>

<script setup lang="ts">
    import SvgSpinButton from './components/svg-spin-button/SvgSpinButton.vue'

    export interface FooterSpinButtonProps {
        disabled: boolean
    }

    const props = defineProps<FooterSpinButtonProps>()

    const emit = defineEmits<{
        (event: 'click'): void
    }>()
</script>

<style scoped>
    .footer-spin-btn:not(:disabled):hover :deep(.footer-spin-gem-pressed),
    .footer-spin-btn:not(:disabled):active :deep(.footer-spin-gem-pressed) {
        opacity: 0.45;
        transition: opacity 100ms ease-out;
    }

    .footer-spin-btn:disabled :deep(.footer-spin-gem-pressed) {
        opacity: 0.45;
    }

    .footer-spin-btn:disabled .footer-spin-btn-text {
        opacity: 0.5;
    }
</style>

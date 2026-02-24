<template>
    <button
        type="button"
        class="min-max-btn block cursor-pointer select-none disabled:cursor-not-allowed"
        :class="{ 'min-max-btn--pressed': props.disabled }"
        :disabled="props.disabled"
        @click="emit('click')"
    >
        <SvgMinMaxButton />

        <p class="absolute inset-0 flex items-center justify-center pt-[5%] font-cuprum text-game-sm uppercase text-[#1D2844] [text-shadow:0_0.5px_0_#FFFFFF]">
            {{ $t(minMaxLabel) }}
        </p>
    </button>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import SvgMinMaxButton from './components/svg-min-max-button/SvgMinMaxButton.vue'

    export interface MinMaxButtonProps {
        disabled: boolean
        mode: 'min' | 'max'
    }

    const props = defineProps<MinMaxButtonProps>()

    const minMaxLabel = computed(() => (props.mode === 'min' ? 'pirates.actions.min' : 'pirates.actions.max'))

    const emit = defineEmits<{
        (event: 'click'): void
    }>()
</script>

<style scoped>
    .min-max-btn:not(:disabled):hover :deep(.min-max-btn-pressed),
    .min-max-btn:not(:disabled):active :deep(.min-max-btn-pressed),
    .min-max-btn--pressed :deep(.min-max-btn-pressed) {
        opacity: 0.45;
        transition: opacity 100ms ease-out;
    }
</style>

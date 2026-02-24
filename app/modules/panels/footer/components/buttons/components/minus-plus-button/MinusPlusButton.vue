<template>
    <button
        type="button"
        class="minus-plus-btn relative flex cursor-pointer select-none items-center justify-center disabled:cursor-not-allowed"
        :class="{ 'minus-plus-btn--pressed': props.disabled }"
        :disabled="props.disabled"
        @click="emit('click')"
    >
        <SvgMinusPlusButton class="h-full w-full" />

        <p class="absolute inset-0 mx-auto h-full w-max font-cuprum text-game-xl uppercase text-[#1D2844]">
            {{ minusPlusLabel }}
        </p>
    </button>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import SvgMinusPlusButton from './components/svg-minus-plus-button/SvgMinusPlusButton.vue'

    export interface MinusPlusButtonProps {
        disabled: boolean
        mode: 'minus' | 'plus'
    }

    const props = defineProps<MinusPlusButtonProps>()

    const minusPlusLabel = computed(() => (props.mode === 'minus' ? '-' : '+'))

    const emit = defineEmits<{
        (event: 'click'): void
    }>()
</script>

<style scoped>
    .minus-plus-btn:not(:disabled):hover :deep(.minus-plus-btn-pressed),
    .minus-plus-btn:not(:disabled):active :deep(.minus-plus-btn-pressed),
    .minus-plus-btn--pressed :deep(.minus-plus-btn-pressed) {
        opacity: 0.45;
        transition: opacity 80ms ease-out;
    }
</style>

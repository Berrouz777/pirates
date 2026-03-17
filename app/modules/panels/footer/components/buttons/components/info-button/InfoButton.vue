<template>
    <button
        class="info-btn relative flex h-full cursor-pointer select-none items-center justify-center"
        type="button"
        :class="{ 'info-btn--active': props.active }"
        @click="emit('click', $event)"
    >
        <SvgInfoButton class="h-full w-full" />

        <p
            class="pointer-events-none absolute inset-0 flex items-center justify-center text-center font-cuprum text-game-sm uppercase text-[#1D2844] [text-shadow:0_0.4px_0_#FFFFFF]"
        >
            {{ props.label }}
        </p>
    </button>
</template>

<script setup lang="ts">
    import SvgInfoButton from './components/svg-info-button/SvgInfoButton.vue'

    interface InfoButtonProps {
        label: string
        active?: boolean
    }

    const props = defineProps<InfoButtonProps>()

    const emit = defineEmits<{
        (event: 'click', value: MouseEvent): void
    }>()
</script>

<style scoped>
    .info-btn:hover :deep(.info-btn-pressed),
    .info-btn:active :deep(.info-btn-pressed),
    .info-btn--active :deep(.info-btn-pressed) {
        opacity: 0.45;
        transition: opacity 100ms ease-out;
    }
</style>

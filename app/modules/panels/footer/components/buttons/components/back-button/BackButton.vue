<template>
    <button class="back-btn relative flex h-full cursor-pointer select-none items-center justify-center" type="button" @click="emit('click', $event)">
        <SvgBackButtonBg class="absolute inset-0 h-full w-full" />
        <SvgBackButtonArrow class="z-[2] h-[36%] w-[36%]" />
    </button>
</template>

<script setup lang="ts">
    import SvgBackButtonBg from './components/svg-back-button-bg/SvgBackButtonBg.vue'
    import SvgBackButtonArrow from './components/svg-back-button-arrow/SvgBackButtonArrow.vue'

    const emit = defineEmits<{
        (event: 'click', value: MouseEvent): void
    }>()
</script>

<style scoped>
    .back-btn:hover :deep(.back-btn-pressed),
    .back-btn:active :deep(.back-btn-pressed) {
        opacity: 0.45;
        transition: opacity 100ms ease-out;
    }
</style>

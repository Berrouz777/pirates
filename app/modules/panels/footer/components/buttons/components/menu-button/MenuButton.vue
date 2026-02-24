<template>
    <button class="menu-btn flex cursor-pointer select-none items-center justify-center">
        <SvgMenuButton class="z-[2] h-[41%] w-full pt-[3%]" />
        <SvgBgButton class="absolute inset-0 z-[1] h-full w-full" />
    </button>
</template>

<script setup lang="ts">
    import SvgMenuButton from './components/svg-menu-button/SvgMenuButton.vue'
    import SvgBgButton from './components/svg-bg-button/SvgBgButton.vue'
</script>

<style scoped>
    .menu-btn:hover :deep(.menu-btn-pressed),
    .menu-btn:active :deep(.menu-btn-pressed) {
        opacity: 0.45;
        transition: opacity 100ms ease-out;
    }
</style>

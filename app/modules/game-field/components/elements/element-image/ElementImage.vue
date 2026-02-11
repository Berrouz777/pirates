<template>
    <img :alt="alt" :src="src" class="h-full w-full object-contain" />
</template>

<script setup lang="ts">
    export interface ElementImageProps {
        src: string
        alt: string
    }

    // Props
    defineProps<ElementImageProps>()
</script>

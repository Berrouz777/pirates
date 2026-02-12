<template>
    <div class="relative flex min-h-screen w-full items-center justify-center overflow-y-auto supports-[height:100svh]:min-h-svh">
        <img alt="background image" :src="BackgroundImage" class="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover" />
        <div class="relative z-10">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
    import BackgroundImage from '~/assets/images/main-background.jpg'
</script>

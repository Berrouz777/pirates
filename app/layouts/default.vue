<template>
    <div class="relative flex min-h-svh w-screen items-center justify-center overflow-y-auto">
        <img src="~/assets/images/main-background.jpg" alt="" class="absolute inset-0 h-full w-full object-cover" />
        <div class="relative z-10">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts"></script>

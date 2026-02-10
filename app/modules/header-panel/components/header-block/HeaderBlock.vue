<template>
    <div class="w-full">
        <img :alt="alt" :src="headerImage" class="h-full w-full object-contain" />
    </div>
</template>

<script setup lang="ts">
    import headerImage from '~/assets/images/header/header.png'

    const alt = 'header'
</script>

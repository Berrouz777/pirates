<template>
    <ElementImage :alt="alt" :src="imageSrc" />
</template>

<script setup lang="ts">
    // Components
    import ElementImage from '../element-image/ElementImage.vue'

    // Assets
    import imageSrc from '~/assets/images/elements/bomb.png'

    const alt = 'Bomb'
</script>

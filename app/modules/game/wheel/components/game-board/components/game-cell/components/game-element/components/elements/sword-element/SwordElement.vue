<template>
    <ElementImage :alt="alt" :src="imageSrc" />
</template>

<script setup lang="ts">
    import ElementImage from '../../element-image/ElementImage.vue'
    import imageSrc from '~/assets/images/elements/sword.png'

    const alt = 'Sword'
</script>

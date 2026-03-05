<template>
    <div class="bonus-element-wrapper">
        <ElementImage :alt="alt" :src="imageSrc" />
    </div>
</template>

<script setup lang="ts">
    import ElementImage from '../../element-image/ElementImage.vue'
    import imageSrc from '~/assets/images/elements/bonus-swords.png'

    const alt = 'Bonus swords'
</script>

<style scoped>
    .bonus-element-wrapper {
        width: 93%;
        height: 93%;
        margin: auto;
    }
</style>

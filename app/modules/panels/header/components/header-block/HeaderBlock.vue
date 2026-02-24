<template>
    <div class="relative h-full min-h-[23.8%] w-full overflow-hidden">
        <img alt="header image" :src="bgImage" class="h-full w-full object-contain" />
        <img alt="header image" :src="tableImage" class="absolute -top-[14%] bottom-0 left-0 right-0 m-auto h-full w-[95%] object-contain" />
        <div class="absolute inset-0 flex items-center justify-center">
            <p class="w-[60%] text-center font-darumadrop text-game-2xl text-white">WIN OVER 20,000x BET!</p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import bgImage from '~/assets/images/header/top-background.png'
    import tableImage from '~/assets/images/header/top-table.png'
</script>

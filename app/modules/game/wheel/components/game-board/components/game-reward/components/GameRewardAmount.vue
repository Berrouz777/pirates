<template>
    <div class="flex h-full w-full items-center justify-center">
        <p class="reward-text-stroke pt-[10%] font-coiny text-game-6xl text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.7)]">
            {{ displayValue }}
        </p>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps<{
        amount: number
    }>()

    const formattedAmount = computed(() => {
        const value = Number.isFinite(props.amount) ? props.amount : 0

        const fixed = value.toFixed(2)
        return fixed.replace(/\.?0+$/, '')
    })

    const displayValue = computed(() => `+${formattedAmount.value}`)
</script>

<style scoped>
    .reward-text-stroke {
        -webkit-text-stroke: 3px #1e3483;
        paint-order: stroke fill;
    }
</style>

<template>
    <div class="relative w-full">
        <img alt="footer image" :src="footerImage" class="h-full w-full object-contain" />
        <button
            class="absolute right-[6.5%] top-[33.5%] h-[38%] w-[28%] rounded-lg bg-[#DE4548] px-4 py-2 text-game-lg font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-[#3E1767] enabled:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#770E39]"
            :disabled="isSpinning"
            type="button"
            @click="emit('spin')"
        >
            {{ $t('pirates.actions.spin') }}
        </button>
    </div>
</template>

<script setup lang="ts">
    import footerImage from '~/assets/images/footer/bottom.png'

    export interface FooterBlockProps {
        isSpinning: boolean
    }

    defineProps<FooterBlockProps>()

    const emit = defineEmits<{
        (event: 'spin'): void
    }>()
</script>

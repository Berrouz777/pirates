<template>
    <div class="relative w-full">
        <img :alt="alt" :src="footerImage" class="h-full w-full object-contain" />
        <button
            class="absolute right-[6.5%] top-[33.5%] h-[38%] w-[28%] rounded-lg bg-[#DE4548] px-4 py-2 text-[16px] font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-[#3E1767] lg:text-[24px] enabled:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#770E39]"
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

    // Props
    defineProps<FooterBlockProps>()

    // Emits
    const emit = defineEmits<{
        (event: 'spin'): void
    }>()

    const alt = 'footer'
</script>

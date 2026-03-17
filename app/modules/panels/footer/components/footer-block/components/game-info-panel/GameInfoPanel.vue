<template>
    <Teleport to=".game-container">
        <div v-if="props.modelValue" class="absolute inset-0 z-[120] flex items-center justify-center">
            <div class="absolute inset-0 bg-[#0c1930]/55" @mousedown.self="closePanel" />

            <div
                class="game-info-panel relative z-[1] flex h-full w-full flex-col overflow-hidden border border-[#5f779c] bg-[#22385d] px-[5.5%] py-[7.5%] shadow-2xl"
            >
                <div class="flex items-center justify-between bg-[#314c75] p-[2%]">
                    <BackButton class="h-full w-[15%]" type="button" @click="closePanel" />
                    <InfoButton class="h-full w-[42%]" :active="activeTab === 'info'" label="INFO" @click="activeTab = 'info'" />
                    <InfoButton class="h-full w-[42%]" :active="activeTab === 'history'" label="GAME HISTORY" @click="activeTab = 'history'" />
                </div>

                <div class="custom-scroll min-h-0 flex-1 overflow-y-auto text-[#d9e4f5]">
                    <InfoTab v-if="activeTab === 'info'" />
                    <HistoryTab v-else />
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
    import { onBeforeUnmount, ref, watch } from 'vue'

    import InfoTab from './components/info-tab/InfoTab.vue'
    import HistoryTab from './components/history-tab/HistoryTab.vue'
    import InfoButton from '../../../buttons/components/info-button/InfoButton.vue'
    import BackButton from '../../../buttons/components/back-button/BackButton.vue'

    interface GameInfoPanelProps {
        modelValue: boolean
    }

    const props = defineProps<GameInfoPanelProps>()
    const emit = defineEmits<{
        (event: 'update:modelValue', value: boolean): void
    }>()

    const activeTab = ref<'info' | 'history'>('info')
    const bodyOverflowBeforeOpen = ref('')

    const closePanel = () => {
        emit('update:modelValue', false)
    }

    const handleEscape = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') {
            return
        }
        closePanel()
    }

    watch(
        () => props.modelValue,
        (isOpen) => {
            if (isOpen) {
                activeTab.value = 'info'
                bodyOverflowBeforeOpen.value = document.body.style.overflow
                document.body.style.overflow = 'hidden'
                window.addEventListener('keydown', handleEscape)
                return
            }

            document.body.style.overflow = bodyOverflowBeforeOpen.value
            window.removeEventListener('keydown', handleEscape)
        },
        { immediate: true }
    )

    onBeforeUnmount(() => {
        document.body.style.overflow = bodyOverflowBeforeOpen.value
        window.removeEventListener('keydown', handleEscape)
    })
</script>

<style scoped>
    .panel-tab-btn {
        border: 1px solid #7e95b9;
        background: #22385d;
        color: #d9e4f5;
        padding: 0.35rem 0.8rem;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.03em;
    }

    .panel-tab-btn--active {
        background: #3d5e8d;
    }

    .custom-scroll {
        scrollbar-width: thin;
        scrollbar-color: #9fb6d8 transparent;
    }

    .custom-scroll::-webkit-scrollbar {
        width: 2px;
    }

    .custom-scroll::-webkit-scrollbar-track {
        background: transparent;
    }

    .custom-scroll::-webkit-scrollbar-thumb {
        background: #9fb6d8;
        border-radius: 9999px;
    }

    .custom-scroll::-webkit-scrollbar-button {
        display: none;
        width: 0;
        height: 0;
    }

    .game-info-panel {
        background-image: url('@/assets/images/footer/info-bg.png');
        background-size: 100% 100%;
        background-position: center;
        background-repeat: no-repeat;
    }
</style>

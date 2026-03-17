<template>
    <!-- Нужно поправить ещё верстку по макетам -->
    <section class="space-y-[1.5%] text-game-sm md:text-game-xs">
        <p class="border border-[#4f678c] bg-[#1d3152] px-[3%] py-[1.2%] text-center font-bold tracking-wide">SYMBOLS PAY OUT WHEREVER THEY APPEAR</p>

        <div class="space-y-[0.75%] border border-[#4f678c] bg-[#1d3152] p-[1.5%]">
            <div class="flex justify-between gap-[2%] border-b border-[#4f678c] pb-[0.75%]">
                <span>BASE GAME MAX WIN:</span>
                <b>150x BET</b>
            </div>
            <div class="flex justify-between gap-[2%] pt-[0.75%]">
                <span>BONUS GAME MAX WIN:</span>
                <b>1000x BET</b>
            </div>
        </div>

        <div class="overflow-hidden border border-[#4f678c] bg-[#1a2b46]">
            <div
                class="grid grid-cols-[52px_repeat(5,minmax(0,1fr))] border-b border-[#4f678c] bg-[#263f66] px-[1.5%] py-[1%] text-center text-game-sm font-bold md:text-game-xs"
            >
                <span class="text-left">Symbols</span>
                <span v-for="column in infoColumns" :key="column">{{ column }}</span>
            </div>
            <div>
                <div
                    v-for="row in infoRows"
                    :key="row.id"
                    class="grid grid-cols-[52px_repeat(5,minmax(0,1fr))] items-center border-b border-[#314c75] px-[1.5%] py-[0.9%] text-center text-game-sm odd:bg-[#1f3556] even:bg-[#1a2b46] md:text-game-xs"
                >
                    <div class="flex items-center justify-center">
                        <img :src="row.icon" :alt="row.name" class="h-[55%] w-[55%] object-contain" />
                    </div>
                    <span v-for="(value, index) in row.payouts" :key="`${row.id}-${index}`">{{ value }}</span>
                </div>
            </div>
        </div>

        <div class="overflow-hidden border border-[#4f678c] bg-[#1d3152]">
            <div
                class="grid grid-cols-[52px_repeat(4,minmax(0,1fr))] border-b border-[#4f678c] bg-[#263f66] px-[1.5%] py-[1%] text-center text-game-sm font-bold md:text-game-xs"
            >
                <span class="text-left">Scatter</span>
                <span v-for="column in historyColumns" :key="`scatter-header-${column}`">{{ column }}</span>
            </div>
            <div class="grid grid-cols-[52px_repeat(4,minmax(0,1fr))] items-center gap-[0.75%] p-[0.75%] text-center">
                <div class="flex items-center justify-center">
                    <img :src="bonusScatterIcon" alt="Scatter symbol" class="h-[100%] w-[70%] object-contain" />
                </div>
                <div v-for="reward in scatterRewardCards" :key="reward.id" class="h-full w-full overflow-hidden">
                    <img :src="reward.image" :alt="reward.alt" class="h-full w-full object-cover" />
                </div>
            </div>
        </div>

        <div class="space-y-[1%] border border-[#4f678c] bg-[#1d3152] p-[1.5%]">
            <p class="font-bold">Bonus Game Symbol</p>
            <div class="flex items-center gap-[1.2%]">
                <img :src="bonusSymbolIcon" alt="Bonus game symbol" class="h-[15%] w-[15%] object-contain" />
                <p>Collect 100 Bonus Game Symbols to trigger the Bonus Game. Each Bonus Game Symbol that appears counts.</p>
            </div>
        </div>

        <div class="overflow-hidden border border-[#4f678c] bg-[#1d3152]">
            <div class="grid grid-cols-[34%_66%] border-b border-[#4f678c] text-center font-bold">
                <p class="border-r border-[#4f678c] px-[1.5%] py-[0.9%]">Bonus Game</p>
                <p class="px-[1.5%] py-[0.9%]">Bonus Game randomly drops Prizes:</p>
            </div>
            <div class="grid grid-cols-[34%_66%]">
                <div class="flex items-center justify-center border-r border-[#4f678c] p-[1.5%]">
                    <img :src="bonusChestIcon" alt="Bonus chest" class="h-[60%] w-full object-contain" />
                </div>
                <div class="grid grid-cols-3 gap-[1.75%] p-[1.75%]">
                    <div v-for="prize in bonusPrizeCards" :key="prize.id" class="h-full w-full overflow-hidden bg-[#3c2f6d]">
                        <img v-if="prize.image" :src="prize.image" :alt="prize.alt" class="h-full w-full object-cover" />
                        <div v-else class="flex h-full items-center justify-center font-bold text-[#d9e4f5]">
                            {{ prize.label }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
    import {
        BONUS_PRIZE_CARDS,
        INFO_COLUMNS,
        INFO_ROWS,
        SCATTER_REWARD_CARDS,
        HISTORY_COLUMNS,
        bonusChestIcon,
        bonusSymbolIcon,
        bonusScatterIcon
    } from '../../constants/game-info-panel.constants'

    const infoColumns = INFO_COLUMNS
    const infoRows = INFO_ROWS
    const scatterRewardCards = SCATTER_REWARD_CARDS
    const historyColumns = HISTORY_COLUMNS
    const bonusPrizeCards = BONUS_PRIZE_CARDS
</script>

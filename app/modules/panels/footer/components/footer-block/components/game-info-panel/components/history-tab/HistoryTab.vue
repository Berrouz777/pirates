<template>
    <section class="space-y-[1.5%] text-game-sm md:text-game-xs">
        <div class="space-y-[1%] border border-[#4f678c] bg-[#1a2b46] p-[1.5%]">
            <p class="text-center font-bold">Game history</p>

            <div class="space-y-[0.75%]">
                <div class="flex items-center justify-between text-[#d9e4f5]">
                    <span>Last win</span>
                    <span class="font-bold">150x BET</span>
                </div>
                <div class="flex items-center justify-between text-[#d9e4f5]/80">
                    <span>Biggest win</span>
                    <span class="font-bold">1000x BET</span>
                </div>
                <div class="flex items-center justify-between text-[#d9e4f5]/70">
                    <span>Spins played</span>
                    <span class="font-bold">123</span>
                </div>
            </div>
        </div>

        <div class="overflow-hidden border border-[#4f678c] bg-[#1d3152]">
            <div class="grid grid-cols-[36%_32%_32%] border-b border-[#4f678c] bg-[#263f66] px-[1.5%] py-[1%] text-center font-bold">
                <span class="text-left">Date</span>
                <span>Bet</span>
                <span>Win</span>
            </div>
            <div class="max-h-[40vh] space-y-[0.5%] overflow-y-auto px-[1.5%] py-[1%] text-game-xs md:text-game-xs">
                <div
                    v-for="index in 8"
                    :key="index"
                    class="grid grid-cols-[36%_32%_32%] items-center border-b border-[#314c75] py-[0.6%] text-center odd:bg-[#1f3556] even:bg-[#1a2b46]"
                >
                    <span class="text-left text-[#d9e4f5]/80">12.07 · 14:3{{ index }}</span>
                    <span class="text-[#d9e4f5]">1.00</span>
                    <span class="font-bold text-[#ffd86b]">{{ index % 3 === 0 ? '150x' : index % 2 === 0 ? '10x' : '—' }}</span>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
    // Рыбные данные, реальная история будет подключена позже
</script>

<template>
    <component :is="elementComponent" class="h-full w-full" />
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    import type { ElementType } from '../../../../../../types'

    import BonusGameElement from './components/elements/bonus-game-element/BonusGameElement.vue'
    import BombElement from './components/elements/bomb-element/BombElement.vue'
    import CannonElement from './components/elements/cannon-element/CannonElement.vue'
    import KegElement from './components/elements/keg-element/KegElement.vue'
    import MusketoonElement from './components/elements/musketoon-element/MusketoonElement.vue'
    import ShieldElement from './components/elements/shield-element/ShieldElement.vue'
    import SwordElement from './components/elements/sword-element/SwordElement.vue'
    import TankardElement from './components/elements/tankard-element/TankardElement.vue'
    import WheelElement from './components/elements/wheel-element/WheelElement.vue'

    export interface GameElementProps {
        type: ElementType
    }

    const props = defineProps<GameElementProps>()

    const elementComponent = computed(() => {
        const elementsMap: Record<ElementType, unknown> = {
            'wheel': WheelElement,
            'bonus-game': BonusGameElement,
            'bomb': BombElement,
            'sword': SwordElement,
            'shield': ShieldElement,
            'musketoon': MusketoonElement,
            'keg': KegElement,
            'tankard': TankardElement,
            'cannon': CannonElement
        }

        return elementsMap[props.type]
    })
</script>

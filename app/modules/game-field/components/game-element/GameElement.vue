<template>
    <component :is="elementComponent" class="h-full w-full" />
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    import type { ElementType } from '../../types/game-field.types'

    // Elements
    import BombElement from '../elements/bomb-element/BombElement.vue'
    import CannonElement from '../elements/cannon-element/CannonElement.vue'
    import KegElement from '../elements/keg-element/KegElement.vue'
    import MusketoonElement from '../elements/musketoon-element/MusketoonElement.vue'
    import ShieldElement from '../elements/shield-element/ShieldElement.vue'
    import SwordElement from '../elements/sword-element/SwordElement.vue'
    import TankardElement from '../elements/tankard-element/TankardElement.vue'
    import WheelElement from '../elements/wheel-element/WheelElement.vue'

    export interface GameElementProps {
        type: ElementType
    }

    // Props
    const props = defineProps<GameElementProps>()

    // Computed
    const elementComponent = computed(() => {
        const elementsMap: Record<ElementType, unknown> = {
            wheel: WheelElement,
            bomb: BombElement,
            sword: SwordElement,
            shield: ShieldElement,
            musketoon: MusketoonElement,
            keg: KegElement,
            tankard: TankardElement,
            cannon: CannonElement
        }

        return elementsMap[props.type]
    })
</script>

import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { ElementType, WinResult } from '../types/game-field.types'

import { createBoard, resolveWins } from '../utils/game-field.utils'

export const useGameFieldStore = defineStore('game-field', () => {
    // State
    const board = ref<ElementType[]>([])
    const isSpinning = ref<boolean>(false)
    const lastWins = ref<WinResult[]>([])

    // Methods
    const initBoard = () => {
        board.value = createBoard({ avoidWin: true })
        lastWins.value = []
    }

    const spin = () => {
        isSpinning.value = true
        board.value = createBoard({ avoidWin: false })

        const result = resolveWins(board.value)
        board.value = result.board
        lastWins.value = result.wins
        isSpinning.value = false
    }

    return {
        board,
        isSpinning,
        lastWins,
        initBoard,
        spin
    }
})

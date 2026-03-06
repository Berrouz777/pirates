import type { BonusRouletteResult, ElementType } from '../../../app/modules/game/wheel'
import { BOARD_SIZE, BONUS_ROULETTE_CELLS, CASH_MULTIPLIER_BY_KEY, MULTIPLE_VALUE_BY_KEY } from '../../../app/modules/game/wheel/constants'

type NonBonusElementType = Exclude<ElementType, 'bonus-game'>
type ElementCounts = Record<ElementType, number>
type MultipleCellKey = keyof typeof MULTIPLE_VALUE_BY_KEY
type CashCellKey = keyof typeof CASH_MULTIPLIER_BY_KEY

interface DropResolution {
    survivors: ElementCounts
    removedTotal: number
    removedBonus: number
}

export interface GeneratedDropTemplate {
    counts: Record<string, number>
    explodingGroups: Array<{ type: ElementType; count: number }>
    bonusProgress: number
}

export interface GeneratedSpinTemplate {
    id: string
    drops: GeneratedDropTemplate[]
    bonusTriggered: boolean
    bonusRouletteResult: BonusRouletteResult | null
}

export interface RandomSpinGeneratorInput {
    bonusProgress: number
    spinNumber: number
}

const BONUS_PROGRESS_MAX = 100
const MIN_GROUP_SIZE = 10
const MAX_ACTION_DROPS = 3
const MAX_BONUS_PER_ACTION = 8
const MAX_BUILD_ATTEMPTS = 30

const REGULAR_ELEMENTS: NonBonusElementType[] = ['wheel', 'bomb', 'sword', 'shield', 'musketoon', 'keg', 'tankard', 'cannon']
const ALL_ELEMENTS: ElementType[] = [...REGULAR_ELEMENTS, 'bonus-game']

const BONUS_PROBABILITY_PER_CELL = 1 / 32

const createEmptyCounts = (): ElementCounts => ({
    'wheel': 0,
    'bomb': 0,
    'sword': 0,
    'shield': 0,
    'musketoon': 0,
    'keg': 0,
    'tankard': 0,
    'cannon': 0,
    'bonus-game': 0
})

const cloneCounts = (counts: ElementCounts): ElementCounts => ({ ...counts })

const randomInt = (min: number, max: number): number => {
    if (max <= min) return min
    return Math.floor(Math.random() * (max - min + 1)) + min
}

const randomBool = (probability: number): boolean => Math.random() < probability

const pickRandom = <T>(items: T[]): T => items[randomInt(0, items.length - 1)]!

const shuffleCopy = <T>(items: T[]): T[] => {
    const copy = [...items]
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = randomInt(0, index)
        ;[copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!]
    }
    return copy
}

const isMultipleCellKey = (key: BonusRouletteResult['cellKey']): key is MultipleCellKey => key in MULTIPLE_VALUE_BY_KEY

const isCashCellKey = (key: BonusRouletteResult['cellKey']): key is CashCellKey => key in CASH_MULTIPLIER_BY_KEY

const sumCounts = (counts: ElementCounts): number => ALL_ELEMENTS.reduce((sum, type) => sum + (counts[type] ?? 0), 0)

const hasExplodingCandidate = (counts: ElementCounts): boolean => REGULAR_ELEMENTS.some((type) => counts[type] >= MIN_GROUP_SIZE)

const toElementCounts = (counts: Record<string, number>): ElementCounts => {
    const parsed = createEmptyCounts()

    for (const type of ALL_ELEMENTS) {
        const value = counts[type]
        if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
            parsed[type] = Math.floor(value)
        }
    }

    return parsed
}

const toSerializableCounts = (counts: ElementCounts): Record<string, number> => {
    const serialized: Record<string, number> = {}

    for (const type of ALL_ELEMENTS) {
        const value = counts[type]
        if (value > 0) {
            serialized[type] = value
        }
    }

    return serialized
}

const addCounts = (left: ElementCounts, right: ElementCounts): ElementCounts => {
    const combined = createEmptyCounts()

    for (const type of ALL_ELEMENTS) {
        combined[type] = (left[type] ?? 0) + (right[type] ?? 0)
    }

    return combined
}

const normalizeBonusProgress = (progress: number): number => {
    if (!Number.isFinite(progress)) return 0
    if (progress >= BONUS_PROGRESS_MAX) return 0
    return Math.max(0, Math.min(BONUS_PROGRESS_MAX, Math.floor(progress)))
}

const getTargetBonusGain = (currentProgress: number): number => {
    const remaining = BONUS_PROGRESS_MAX - currentProgress

    if (remaining <= 10) {
        return remaining
    }

    if (remaining <= 20) {
        return randomInt(6, remaining)
    }

    if (remaining <= 40) {
        return randomInt(6, Math.min(14, remaining))
    }

    return randomInt(8, Math.min(16, remaining))
}

const resolveActionDropCount = (targetBonusGain: number): number => {
    const minDrops = Math.max(1, Math.ceil(targetBonusGain / MAX_BONUS_PER_ACTION))
    const maxDrops = Math.max(minDrops, Math.min(MAX_ACTION_DROPS, targetBonusGain))
    return randomInt(minDrops, maxDrops)
}

const distributeRegularElements = (counts: ElementCounts, amount: number) => {
    let remaining = amount

    while (remaining > 0) {
        const type = pickRandom(REGULAR_ELEMENTS)
        counts[type] += 1
        remaining -= 1
    }
}

const createInitialDropCounts = (): ElementCounts => {
    const counts = createEmptyCounts()

    for (let index = 0; index < BOARD_SIZE; index += 1) {
        if (randomBool(BONUS_PROBABILITY_PER_CELL)) {
            counts['bonus-game'] += 1
        } else {
            const type = pickRandom(REGULAR_ELEMENTS)
            counts[type] += 1
        }
    }

    return counts
}

const createRandomFillCounts = (fillSize: number): ElementCounts => {
    const counts = createEmptyCounts()

    if (fillSize <= 0) {
        return counts
    }

    for (let index = 0; index < fillSize; index += 1) {
        if (randomBool(BONUS_PROBABILITY_PER_CELL)) {
            counts['bonus-game'] += 1
        } else {
            const type = pickRandom(REGULAR_ELEMENTS)
            counts[type] += 1
        }
    }

    return counts
}

const forceExplodingCandidate = (survivors: ElementCounts, fillCounts: ElementCounts): ElementCounts => {
    const boardAfterFill = addCounts(survivors, fillCounts)
    if (hasExplodingCandidate(boardAfterFill)) {
        return fillCounts
    }

    let targetType: NonBonusElementType = REGULAR_ELEMENTS[0]!
    for (const type of REGULAR_ELEMENTS) {
        if (boardAfterFill[type] > boardAfterFill[targetType]) {
            targetType = type
        }
    }

    let missing = Math.max(0, MIN_GROUP_SIZE - boardAfterFill[targetType])
    if (missing === 0) {
        return fillCounts
    }

    const adjusted = cloneCounts(fillCounts)

    for (const sourceType of REGULAR_ELEMENTS) {
        if (sourceType === targetType) continue

        while (missing > 0 && adjusted[sourceType] > 0) {
            adjusted[sourceType] -= 1
            adjusted[targetType] += 1
            missing -= 1
        }
    }

    while (missing > 0 && adjusted['bonus-game'] > 0) {
        adjusted['bonus-game'] -= 1
        adjusted[targetType] += 1
        missing -= 1
    }

    return adjusted
}

const createFillDropCounts = (fillSize: number, survivors: ElementCounts, ensureCandidate: boolean): ElementCounts => {
    if (!ensureCandidate) {
        return createRandomFillCounts(fillSize)
    }

    for (let attempt = 0; attempt < MAX_BUILD_ATTEMPTS; attempt += 1) {
        const candidate = createRandomFillCounts(fillSize)
        const boardAfterFill = addCounts(survivors, candidate)
        if (hasExplodingCandidate(boardAfterFill)) {
            return candidate
        }
    }

    const fallback = createRandomFillCounts(fillSize)
    return forceExplodingCandidate(survivors, fallback)
}

// Генерирует терминальный дроп (без взрывов): гарантирует, что после добавления
// на борд ни один тип не наберёт MIN_GROUP_SIZE и не создаст «призрачную» группу.
const createTerminalDropCounts = (fillSize: number, survivors: ElementCounts): ElementCounts => {
    // Вычисляем, сколько каждого типа уже есть в survivors
    const caps: Partial<Record<NonBonusElementType, number>> = {}
    for (const type of REGULAR_ELEMENTS) {
        const alreadyOnBoard = survivors[type]
        caps[type] = Math.max(0, MIN_GROUP_SIZE - 1 - alreadyOnBoard)
    }

    const counts = createEmptyCounts()
    let remaining = fillSize

    // Распределяем по одному, соблюдая cap для каждого типа
    const shuffledTypes = shuffleCopy(REGULAR_ELEMENTS)
    for (let pass = 0; pass < fillSize * 2 && remaining > 0; pass += 1) {
        const type = shuffledTypes[pass % shuffledTypes.length]!
        const cap = caps[type] ?? 0
        if (counts[type] < cap) {
            counts[type] += 1
            remaining -= 1
        }
    }

    // Если после соблюдения caps остались незаполненные слоты (крайний случай),
    // добираем произвольно — это лучше, чем вернуть неверный размер дропа
    if (remaining > 0) {
        distributeRegularElements(counts, remaining)
    }

    return counts
}

const chooseExplodingGroups = (boardCounts: ElementCounts, forceAtLeastOne: boolean): Array<{ type: ElementType; count: number }> => {
    const candidates = shuffleCopy(REGULAR_ELEMENTS.filter((type) => boardCounts[type] >= MIN_GROUP_SIZE))
    if (candidates.length === 0) {
        return []
    }

    if (!forceAtLeastOne && boardCounts['bonus-game'] > 0 && randomBool(0.2)) {
        return []
    }

    const groupCount = candidates.length > 1 && randomBool(0.35) ? 2 : 1

    return candidates.slice(0, groupCount).map((type) => {
        return {
            type,
            // Для предсказуемости моков удаляем весь доступный объём выбранного символа.
            count: boardCounts[type]
        }
    })
}

const resolveDrop = (boardCounts: ElementCounts, explodingGroups: Array<{ type: ElementType; count: number }>): DropResolution => {
    const survivors = cloneCounts(boardCounts)
    let removedTotal = 0

    for (const group of explodingGroups) {
        const available = survivors[group.type] ?? 0
        const toRemove = Math.max(0, Math.min(group.count, available))
        survivors[group.type] = available - toRemove
        removedTotal += toRemove
    }

    const removedBonus = survivors['bonus-game']
    if (removedBonus > 0) {
        survivors['bonus-game'] = 0
        removedTotal += removedBonus
    }

    return {
        survivors,
        removedTotal,
        removedBonus
    }
}

const createRandomBonusRouletteResult = (): BonusRouletteResult => {
    const cellKey = pickRandom(BONUS_ROULETTE_CELLS)

    if (cellKey === 'empty') {
        return {
            cellKey,
            prizeType: 'empty',
            freeSpinsCount: null,
            multipleValue: null,
            cashMultiplier: null,
            cashAmount: null
        }
    }

    if (cellKey === 'freespin-5') {
        return {
            cellKey,
            prizeType: 'freespins',
            freeSpinsCount: 5,
            multipleValue: null,
            cashMultiplier: null,
            cashAmount: null
        }
    }

    if (isMultipleCellKey(cellKey)) {
        return {
            cellKey,
            prizeType: 'multiple',
            freeSpinsCount: null,
            multipleValue: MULTIPLE_VALUE_BY_KEY[cellKey],
            cashMultiplier: null,
            cashAmount: null
        }
    }

    return {
        cellKey,
        prizeType: 'cash',
        freeSpinsCount: null,
        multipleValue: null,
        cashMultiplier: isCashCellKey(cellKey) ? CASH_MULTIPLIER_BY_KEY[cellKey] : null,
        cashAmount: null
    }
}

const isRouletteResultValid = (result: BonusRouletteResult): boolean => {
    if (!BONUS_ROULETTE_CELLS.includes(result.cellKey)) {
        return false
    }

    if (result.prizeType === 'empty') {
        return result.cellKey === 'empty' && result.freeSpinsCount === null && result.multipleValue === null && result.cashMultiplier === null
    }

    if (result.prizeType === 'freespins') {
        return result.cellKey === 'freespin-5' && result.freeSpinsCount === 5
    }

    if (result.prizeType === 'multiple') {
        return isMultipleCellKey(result.cellKey) && result.multipleValue === MULTIPLE_VALUE_BY_KEY[result.cellKey]
    }

    return isCashCellKey(result.cellKey) && result.cashMultiplier === CASH_MULTIPLIER_BY_KEY[result.cellKey]
}

const validateGeneratedTemplate = (template: GeneratedSpinTemplate, startProgress: number): boolean => {
    if (template.drops.length === 0) {
        return false
    }

    let expectedDropSize = BOARD_SIZE
    let survivors = createEmptyCounts()
    let computedProgress = startProgress

    for (const [dropIndex, drop] of template.drops.entries()) {
        const dropCounts = toElementCounts(drop.counts)
        if (sumCounts(dropCounts) !== expectedDropSize) {
            return false
        }

        const boardBeforeDrop = dropIndex === 0 ? dropCounts : addCounts(survivors, dropCounts)

        for (const group of drop.explodingGroups) {
            if (!REGULAR_ELEMENTS.includes(group.type as NonBonusElementType)) {
                return false
            }
            if (group.count < MIN_GROUP_SIZE) {
                return false
            }
            if ((boardBeforeDrop[group.type] ?? 0) < group.count) {
                return false
            }
        }

        const resolved = resolveDrop(boardBeforeDrop, drop.explodingGroups)
        computedProgress = Math.min(BONUS_PROGRESS_MAX, computedProgress + resolved.removedBonus)

        if (drop.bonusProgress !== computedProgress) {
            return false
        }

        if (dropIndex < template.drops.length - 1 && resolved.removedTotal <= 0) {
            return false
        }

        const isTerminalDrop = dropIndex === template.drops.length - 1 && drop.explodingGroups.length === 0
        if (isTerminalDrop && hasExplodingCandidate(boardBeforeDrop)) {
            return false
        }

        survivors = resolved.survivors
        expectedDropSize = resolved.removedTotal
    }

    const computedTriggered = computedProgress >= BONUS_PROGRESS_MAX
    if (computedTriggered !== template.bonusTriggered) {
        return false
    }

    if (template.bonusTriggered && !template.bonusRouletteResult) {
        return false
    }

    if (!template.bonusTriggered && template.bonusRouletteResult) {
        return false
    }

    return template.bonusRouletteResult ? isRouletteResultValid(template.bonusRouletteResult) : true
}

const buildRandomTemplate = (spinNumber: number, startProgress: number): GeneratedSpinTemplate => {
    const targetBonusGain = getTargetBonusGain(startProgress)
    const actionDropCount = resolveActionDropCount(targetBonusGain)

    const drops: GeneratedDropTemplate[] = []
    let progress = startProgress

    let currentDropCounts = createInitialDropCounts()
    let survivors = createEmptyCounts()
    let removedFromLastDrop = 0

    for (let actionIndex = 0; actionIndex < actionDropCount; actionIndex += 1) {
        const boardBeforeDrop = actionIndex === 0 ? currentDropCounts : addCounts(survivors, currentDropCounts)
        const forceAtLeastOneGroup = actionIndex < actionDropCount - 1
        const explodingGroups = chooseExplodingGroups(boardBeforeDrop, forceAtLeastOneGroup)
        const resolved = resolveDrop(boardBeforeDrop, explodingGroups)

        progress = Math.min(BONUS_PROGRESS_MAX, progress + resolved.removedBonus)

        drops.push({
            counts: toSerializableCounts(currentDropCounts),
            explodingGroups,
            bonusProgress: progress
        })

        survivors = resolved.survivors
        removedFromLastDrop = resolved.removedTotal

        if (removedFromLastDrop <= 0) {
            break
        }

        if (actionIndex < actionDropCount - 1) {
            currentDropCounts = createFillDropCounts(resolved.removedTotal, survivors, true)
        }
    }

    if (removedFromLastDrop > 0) {
        const terminalCounts = createTerminalDropCounts(removedFromLastDrop, survivors)
        drops.push({
            counts: toSerializableCounts(terminalCounts),
            explodingGroups: [],
            bonusProgress: progress
        })
    }

    const bonusTriggered = progress >= BONUS_PROGRESS_MAX

    return {
        id: `spin-random-${spinNumber + 1}-${Date.now()}-${randomInt(1000, 9999)}`,
        drops,
        bonusTriggered,
        bonusRouletteResult: bonusTriggered ? createRandomBonusRouletteResult() : null
    }
}

export const generateRandomSpinTemplate = ({ bonusProgress, spinNumber }: RandomSpinGeneratorInput): GeneratedSpinTemplate => {
    const startProgress = normalizeBonusProgress(bonusProgress)

    for (let attempt = 0; attempt < MAX_BUILD_ATTEMPTS; attempt += 1) {
        const template = buildRandomTemplate(spinNumber, startProgress)
        if (validateGeneratedTemplate(template, startProgress)) {
            return template
        }
    }

    throw new Error('Failed to generate valid spin template')
}

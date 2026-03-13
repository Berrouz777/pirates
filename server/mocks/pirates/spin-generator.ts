import type { BonusRouletteResult, ElementType } from '../../../app/modules/game/wheel'
import { BOARD_SIZE, BONUS_ROULETTE_CELLS, CASH_MULTIPLIER_BY_KEY, MULTIPLE_VALUE_BY_KEY } from '../../../app/modules/game/wheel/constants'
import {
    ALL_ELEMENTS,
    BONUS_PROGRESS_MAX,
    ELEMENT_PROBABILITIES_PERCENT,
    MAX_ACTION_DROPS,
    MAX_BONUS_PER_ACTION,
    MAX_BUILD_ATTEMPTS,
    MIN_EXPLODING_GROUP_SIZE_BY_ELEMENT,
    MIN_SCATTER_GROUP_SIZE,
    PROGRESS_ROULETTE_TOTAL_WEIGHT,
    PROGRESS_ROULETTE_WEIGHT_EPSILON,
    PROGRESS_ROULETTE_WEIGHTS,
    REGULAR_ELEMENTS
} from './spin-generator.constants'
import type {
    DropResolution,
    ElementCounts,
    ExplodingGroup,
    GeneratedDropTemplate,
    GeneratedSpinTemplate,
    NonBonusElementType,
    RandomSpinGeneratorInput
} from './spin-generator.types'

type MultipleCellKey = keyof typeof MULTIPLE_VALUE_BY_KEY
type CashCellKey = keyof typeof CASH_MULTIPLIER_BY_KEY

const createEmptyCounts = (): ElementCounts => ({
    'wheel': 0,
    'bomb': 0,
    'sword': 0,
    'shield': 0,
    'musketoon': 0,
    'keg': 0,
    'tankard': 0,
    'cannon': 0,
    'bonus-game': 0,
    'bonus-scatter': 0
})

const cloneCounts = (counts: ElementCounts): ElementCounts => ({ ...counts })

const randomInt = (min: number, max: number): number => {
    if (max <= min) return min
    return Math.floor(Math.random() * (max - min + 1)) + min
}

const randomBool = (probability: number): boolean => Math.random() < probability

const pickRandom = <T>(items: T[]): T => items[randomInt(0, items.length - 1)]!

const pickRandomElementType = (allowScatter: boolean): ElementType => {
    const entries: Array<{ type: ElementType; weight: number }> = []

    for (const type of ALL_ELEMENTS) {
        if (!allowScatter && type === 'bonus-scatter') continue
        const weight = ELEMENT_PROBABILITIES_PERCENT[type]
        if (weight > 0) {
            entries.push({ type, weight })
        }
    }

    const totalWeight = entries.reduce((sum, { weight }) => sum + weight, 0)
    if (totalWeight <= 0) {
        // Fallback на случай некорректной конфигурации.
        return pickRandom(allowScatter ? ALL_ELEMENTS : (ALL_ELEMENTS.filter((type) => type !== 'bonus-scatter') as ElementType[]))
    }

    const roll = Math.random() * totalWeight
    let accumulated = 0

    for (const { type, weight } of entries) {
        accumulated += weight
        if (roll < accumulated) {
            return type
        }
    }

    // Fallback на правой границе.
    return entries[entries.length - 1]!.type
}

const pickProgressRouletteCellKey = (): (typeof PROGRESS_ROULETTE_WEIGHTS)[number]['cellKey'] => {
    const totalWeight = PROGRESS_ROULETTE_WEIGHTS.reduce((sum, item) => sum + item.weight, 0)
    if (Math.abs(totalWeight - PROGRESS_ROULETTE_TOTAL_WEIGHT) > PROGRESS_ROULETTE_WEIGHT_EPSILON) {
        throw new Error(`Invalid progress roulette total weight: ${totalWeight}`)
    }

    const roll = Math.random() * totalWeight
    let accumulated = 0

    for (const item of PROGRESS_ROULETTE_WEIGHTS) {
        accumulated += item.weight
        if (roll < accumulated) {
            return item.cellKey
        }
    }

    // Fallback на случай погрешности float на правой границе.
    return PROGRESS_ROULETTE_WEIGHTS[PROGRESS_ROULETTE_WEIGHTS.length - 1]!.cellKey
}

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

const canExplodeRegularGroup = (type: NonBonusElementType, count: number): boolean => {
    const minGroupSize = MIN_EXPLODING_GROUP_SIZE_BY_ELEMENT[type]
    return count >= minGroupSize
}

const hasExplodingCandidate = (counts: ElementCounts): boolean => REGULAR_ELEMENTS.some((type) => canExplodeRegularGroup(type, counts[type]))

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

const createInitialDropCounts = (allowScatter: boolean): ElementCounts => {
    const counts = createEmptyCounts()
    for (let index = 0; index < BOARD_SIZE; index += 1) {
        const type = pickRandomElementType(allowScatter)
        counts[type] += 1
    }

    return counts
}

const createRandomFillCounts = (fillSize: number, allowScatter: boolean): ElementCounts => {
    const counts = createEmptyCounts()

    if (fillSize <= 0) {
        return counts
    }

    for (let index = 0; index < fillSize; index += 1) {
        const type = pickRandomElementType(allowScatter)
        counts[type] += 1
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

    const targetMinGroupSize = MIN_EXPLODING_GROUP_SIZE_BY_ELEMENT[targetType]
    let missing = Math.max(0, targetMinGroupSize - boardAfterFill[targetType])
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

    while (missing > 0 && adjusted['bonus-scatter'] > 0) {
        adjusted['bonus-scatter'] -= 1
        adjusted[targetType] += 1
        missing -= 1
    }

    return adjusted
}

const createFillDropCounts = (fillSize: number, survivors: ElementCounts, ensureCandidate: boolean, allowScatter: boolean): ElementCounts => {
    if (!ensureCandidate) {
        return createRandomFillCounts(fillSize, allowScatter)
    }

    for (let attempt = 0; attempt < MAX_BUILD_ATTEMPTS; attempt += 1) {
        const candidate = createRandomFillCounts(fillSize, allowScatter)
        const boardAfterFill = addCounts(survivors, candidate)
        if (hasExplodingCandidate(boardAfterFill)) {
            return candidate
        }
    }

    const fallback = createRandomFillCounts(fillSize, allowScatter)
    return forceExplodingCandidate(survivors, fallback)
}

// Генерирует терминальный дроп (без взрывов): гарантирует, что после добавления
// на борд ни один тип не наберёт свой порог взрыва и не создаст «призрачную» группу.
const createTerminalDropCounts = (fillSize: number, survivors: ElementCounts): ElementCounts => {
    // Вычисляем, сколько каждого типа уже есть в survivors
    const caps: Partial<Record<NonBonusElementType, number>> = {}
    for (const type of REGULAR_ELEMENTS) {
        const alreadyOnBoard = survivors[type]
        const minGroupSize = MIN_EXPLODING_GROUP_SIZE_BY_ELEMENT[type]
        caps[type] = Math.max(0, minGroupSize - 1 - alreadyOnBoard)
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

const chooseExplodingGroups = (boardCounts: ElementCounts, forceAtLeastOne: boolean): ExplodingGroup[] => {
    const candidates = shuffleCopy(REGULAR_ELEMENTS.filter((type) => canExplodeRegularGroup(type, boardCounts[type])))
    const scatterCount = boardCounts['bonus-scatter']
    const canExplodeScatter = scatterCount >= MIN_SCATTER_GROUP_SIZE

    if (candidates.length === 0 && !canExplodeScatter) {
        return []
    }

    if (!forceAtLeastOne && boardCounts['bonus-game'] > 0 && randomBool(0.2) && !canExplodeScatter) {
        return []
    }

    const regularGroups: Array<{ type: ElementType; count: number }> = []
    if (candidates.length > 0) {
        const groupCount = candidates.length > 1 && randomBool(0.35) ? 2 : 1

        regularGroups.push(
            ...candidates.slice(0, groupCount).map((type) => {
                return {
                    type,
                    // Для предсказуемости моков удаляем весь доступный объём выбранного символа.
                    count: boardCounts[type]
                }
            })
        )
    }

    if (!canExplodeScatter) {
        return regularGroups
    }

    // Scatter-группа всегда последняя в очереди взрывов.
    // При 7+ scatter взрываем все, приз считается как за 7.
    return [...regularGroups, { type: 'bonus-scatter', count: scatterCount }]
}

const resolveDrop = (boardCounts: ElementCounts, explodingGroups: ExplodingGroup[]): DropResolution => {
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

const createRandomBonusRouletteResult = (): GeneratedSpinTemplate['bonusRouletteResult'] => {
    const cellKey = pickProgressRouletteCellKey()

    if (cellKey === 'freespin-5' || cellKey === 'freespin-10') {
        return {
            cellKey,
            prizeType: 'freespins',
            triggerSource: 'progress',
            freeSpinsCount: cellKey === 'freespin-5' ? 5 : 10,
            multipleValue: null,
            cashMultiplier: null,
            cashAmount: null
        }
    }

    if (isMultipleCellKey(cellKey)) {
        return {
            cellKey,
            prizeType: 'multiple',
            triggerSource: 'progress',
            freeSpinsCount: null,
            multipleValue: MULTIPLE_VALUE_BY_KEY[cellKey],
            cashMultiplier: null,
            cashAmount: null
        }
    }

    return {
        cellKey,
        prizeType: 'cash',
        triggerSource: 'progress',
        freeSpinsCount: null,
        multipleValue: null,
        cashMultiplier: isCashCellKey(cellKey) ? CASH_MULTIPLIER_BY_KEY[cellKey] : null,
        cashAmount: null
    }
}

const isRouletteResultValid = (result: BonusRouletteResult): boolean => {
    if (result.triggerSource !== 'progress' && result.triggerSource !== 'scatter') {
        return false
    }

    if (!BONUS_ROULETTE_CELLS.includes(result.cellKey)) {
        return false
    }

    if (result.prizeType === 'empty') {
        return result.cellKey === 'empty' && result.freeSpinsCount === null && result.multipleValue === null && result.cashMultiplier === null
    }

    if (result.prizeType === 'freespins') {
        return (result.cellKey === 'freespin-5' && result.freeSpinsCount === 5) || (result.cellKey === 'freespin-10' && result.freeSpinsCount === 10)
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
            const isRegularGroup = REGULAR_ELEMENTS.includes(group.type as NonBonusElementType)
            const isScatterGroup = group.type === 'bonus-scatter'

            if (!isRegularGroup && !isScatterGroup) {
                return false
            }
            if (isRegularGroup && !canExplodeRegularGroup(group.type as NonBonusElementType, group.count)) {
                return false
            }
            if (isScatterGroup && group.count < MIN_SCATTER_GROUP_SIZE) {
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

const buildRandomTemplate = (spinNumber: number, startProgress: number, allowScatter: boolean): GeneratedSpinTemplate => {
    const targetBonusGain = getTargetBonusGain(startProgress)
    const actionDropCount = resolveActionDropCount(targetBonusGain)

    const drops: GeneratedDropTemplate[] = []
    let progress = startProgress
    let maxScatterOnBoardInSpin = 0

    let currentDropCounts = createInitialDropCounts(allowScatter)
    let survivors = createEmptyCounts()
    let removedFromLastDrop = 0

    for (let actionIndex = 0; actionIndex < actionDropCount; actionIndex += 1) {
        const boardBeforeDrop = actionIndex === 0 ? currentDropCounts : addCounts(survivors, currentDropCounts)
        maxScatterOnBoardInSpin = Math.max(maxScatterOnBoardInSpin, boardBeforeDrop['bonus-scatter'])
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
            currentDropCounts = createFillDropCounts(resolved.removedTotal, survivors, true, allowScatter)
        }
    }

    if (removedFromLastDrop > 0) {
        const terminalCounts = createTerminalDropCounts(removedFromLastDrop, survivors)
        const boardBeforeTerminalDrop = addCounts(survivors, terminalCounts)
        maxScatterOnBoardInSpin = Math.max(maxScatterOnBoardInSpin, boardBeforeTerminalDrop['bonus-scatter'])
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
        bonusRouletteResult: bonusTriggered ? createRandomBonusRouletteResult() : null,
        maxScatterOnBoardInSpin
    }
}

export const generateRandomSpinTemplate = ({ bonusProgress, spinNumber, allowScatter }: RandomSpinGeneratorInput): GeneratedSpinTemplate => {
    const startProgress = normalizeBonusProgress(bonusProgress)

    for (let attempt = 0; attempt < MAX_BUILD_ATTEMPTS; attempt += 1) {
        const template = buildRandomTemplate(spinNumber, startProgress, allowScatter)
        if (validateGeneratedTemplate(template, startProgress)) {
            return template
        }
    }

    throw new Error('Failed to generate valid spin template')
}

import type { HeaderSignboardVariant } from '../types/header-signboard.types'

export const HEADER_SIGNBOARD_TEXTS: Record<HeaderSignboardVariant, string> = {
    BIG_WIN: 'WIN OVER 20,000x BET!',
    BONUS_GAME: 'BONUS GAME',
    FREESPINS: 'XX FREESPINS!',
    WIN_MULTIPLE: 'XXX WIN MULTIPLE!',
    WIN_JACKPOT: '100000$'
}

export const formatFreespinsText = (count: number) => `${count} FREESPINS!`
export const formatWinMultipleText = (value: number) => `X${value} WIN MULTIPLE!`
export const formatJackpotText = (amount: number) => `${amount}$`

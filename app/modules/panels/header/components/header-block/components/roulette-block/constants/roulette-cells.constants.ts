import type { RouletteCell } from '../types/roulette.types'

import x10Image from '~/assets/images/header/bonuses/10.png'
import x25Image from '~/assets/images/header/bonuses/25.png'
import x50Image from '~/assets/images/header/bonuses/50.png'
import x100Image from '~/assets/images/header/bonuses/100.png'
import x250Image from '~/assets/images/header/bonuses/250.png'
import x1000Image from '~/assets/images/header/bonuses/1000.png'
import winOneHalfImage from '~/assets/images/header/bonuses/x1.5.png'
import winTwoImage from '~/assets/images/header/bonuses/x2.png'
import winFiveImage from '~/assets/images/header/bonuses/x5.png'
import freeSpinFiveImage from '~/assets/images/header/bonuses/free-5.png'

export const ROULETTE_CELLS: RouletteCell[] = [
    { key: 'empty' },
    { key: 'freespin-5', imageSrc: freeSpinFiveImage },
    { key: 'freespin-10', imageSrc: freeSpinFiveImage },
    { key: 'multiple-1.5', imageSrc: winOneHalfImage },
    { key: 'multiple-2', imageSrc: winTwoImage },
    { key: 'multiple-5', imageSrc: winFiveImage },
    { key: 'cash-10', imageSrc: x10Image },
    { key: 'cash-25', imageSrc: x25Image },
    { key: 'cash-50', imageSrc: x50Image },
    { key: 'cash-100', imageSrc: x100Image },
    { key: 'cash-500', imageSrc: x250Image },
    { key: 'cash-1000', imageSrc: x1000Image }
]

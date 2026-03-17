import wheelIcon from '~/assets/images/elements/wheel.png'
import shieldIcon from '~/assets/images/elements/shield.png'
import swordIcon from '~/assets/images/elements/sword.png'
import musketoonIcon from '~/assets/images/elements/musketoon.png'
import kegIcon from '~/assets/images/elements/keg.png'
import tankardIcon from '~/assets/images/elements/tankard.png'
import cannonIcon from '~/assets/images/elements/cannon.png'
import bombIcon from '~/assets/images/elements/bomb.png'
import bonusScatterIcon from '~/assets/images/elements/bonus-scatter.png'
import bonusSymbolIcon from '~/assets/images/elements/bonus-swords.png'
import bonusChestIcon from '~/assets/images/header/box.png'
import x10Image from '~/assets/images/header/bonuses/10.png'
import x25Image from '~/assets/images/header/bonuses/25.png'
import x50Image from '~/assets/images/header/bonuses/50.png'
import x100Image from '~/assets/images/header/bonuses/100.png'
import x250Image from '~/assets/images/header/bonuses/250.png'
import x500Image from '~/assets/images/header/bonuses/500.png'
import x1000Image from '~/assets/images/header/bonuses/1000.png'
import winOneHalfImage from '~/assets/images/header/bonuses/x1.5.png'
import winTwoImage from '~/assets/images/header/bonuses/x2.png'
import winFiveImage from '~/assets/images/header/bonuses/x5.png'
import freeSpinFiveImage from '~/assets/images/header/bonuses/free-5.png'
import freeSpinTenImage from '~/assets/images/header/bonuses/free-10.png'

import type { GameInfoPaytableRow, GameInfoRewardCard } from '../types/game-info-panel.types'

export const INFO_COLUMNS = ['13', '14', '15', '16', '17']
export const HISTORY_COLUMNS = ['4', '5', '6', '7']

export const SCATTER_REWARD_CARDS: GameInfoRewardCard[] = [
    { id: 'scatter-1', alt: 'Scatter x5 free spin', image: freeSpinFiveImage },
    { id: 'scatter-2', alt: 'Scatter x10 free spin', image: freeSpinTenImage },
    { id: 'scatter-3', alt: 'Scatter x1.5 win multiple', image: winOneHalfImage },
    { id: 'scatter-4', alt: 'Scatter x2 win multiple', image: winTwoImage }
]

export const BONUS_PRIZE_CARDS: GameInfoRewardCard[] = [
    { id: 'prize-10', alt: 'Bonus x10', image: x10Image },
    { id: 'prize-25', alt: 'Bonus x25', image: x25Image },
    { id: 'prize-50', alt: 'Bonus x50', image: x50Image },
    { id: 'prize-100', alt: 'Bonus x100', image: x100Image },
    { id: 'prize-250', alt: 'Bonus x250', image: x250Image },
    { id: 'prize-500', alt: 'Bonus x500', image: x500Image },
    { id: 'prize-1000', alt: 'Bonus x1000', image: x1000Image },
    { id: 'prize-x5', alt: 'Bonus x5 multiple', image: winFiveImage },
    { id: 'prize-x2', alt: 'Bonus x2 multiple', image: winTwoImage },
    { id: 'prize-x15', alt: 'Bonus x1.5 multiple', image: winOneHalfImage },
    { id: 'prize-free5', alt: 'Bonus free 5', image: freeSpinFiveImage },
    { id: 'prize-free10', alt: 'Bonus free 10', image: freeSpinTenImage }
]

export const INFO_ROWS: GameInfoPaytableRow[] = [
    { id: 'shield', name: 'Shield', icon: shieldIcon, payouts: ['x1.15', 'x1.5', 'x2.5', 'x5', 'x15'] },
    { id: 'wheel', name: 'Wheel', icon: wheelIcon, payouts: ['x0.5', 'x1.15', 'x1.5', 'x2.5', 'x5'] },
    { id: 'sword', name: 'Sword', icon: swordIcon, payouts: ['x0.25', 'x0.5', 'x1.15', 'x1.5', 'x2.5'] },
    { id: 'musketoon', name: 'Musketoon', icon: musketoonIcon, payouts: ['', 'x0.25', 'x0.5', 'x1.15', 'x1.5'] },
    { id: 'cannon', name: 'Cannon', icon: cannonIcon, payouts: ['', 'x0.25', 'x0.5', 'x1.15', 'x1.5'] },
    { id: 'keg', name: 'Keg', icon: kegIcon, payouts: ['', '', 'x0.25', 'x0.5', 'x1.15'] },
    { id: 'tankard', name: 'Tankard', icon: tankardIcon, payouts: ['', '', 'x0.25', 'x0.5', 'x1.15'] },
    { id: 'bomb', name: 'Bomb', icon: bombIcon, payouts: ['', '', '', 'x0.25', 'x0.5'] }
]

export const HISTORY_ROWS: GameInfoPaytableRow[] = [
    { id: 'bonus', name: 'Bonus', icon: bonusScatterIcon, payouts: ['x0.25', 'x0.5', 'x1.15', 'x1.5'] },
    { id: 'wheel-history', name: 'Wheel', icon: wheelIcon, payouts: ['x0.25', 'x0.5', 'x1.15', 'x1.5'] },
    { id: 'bomb-history', name: 'Bomb', icon: bombIcon, payouts: ['', 'x0.25', 'x0.5', 'x1.15'] },
    { id: 'keg-history', name: 'Keg', icon: kegIcon, payouts: ['', '', 'x0.25', 'x0.5'] },
    { id: 'tankard-history', name: 'Tankard', icon: tankardIcon, payouts: ['', '', 'x0.25', 'x0.5'] },
    { id: 'cannon-history', name: 'Cannon', icon: cannonIcon, payouts: ['', '', 'x0.25', 'x0.5'] }
]

export { bonusSymbolIcon, bonusChestIcon, bonusScatterIcon }

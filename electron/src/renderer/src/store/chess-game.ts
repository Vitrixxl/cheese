import type { WithColor } from '@game-server/types'
import type { GameCategory, GameTimeControl, Outcome, User } from '@shared'
import type { Color } from 'chess.js'
import { atom } from 'jotai'

export const gameIdAtom = atom<string | null>(null)
export const isInQueueAtom = atom<boolean>(false)
export const colorAtom = atom<Color | null>(null)
export const initialTimerAtom = atom<number>(0)
export const timersAtom = atom<Record<Color, number>>({
  w: 0,
  b: 0,
})
export const timerIncrementAtom = atom<number | null>(null)
export const gameCategoryAtom = atom<{
  category: GameCategory
  timeControl: GameTimeControl
} | null>(null)
export const playersAtom = atom<WithColor<User>[]>([])
export const outcomeAtom = atom<{
  winner: User['id'] | null
  outcome: Outcome
} | null>(null)

export const drawOfferAtom = atom<boolean>(false)

export const gameMessagesAtom = atom<{ content: string; userId: User['id'] }[]>([])

export const endGameDialogOpenAtom = atom<boolean>(false)

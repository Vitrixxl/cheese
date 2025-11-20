import type { Challenge } from '@shared'
import { atom } from 'jotai'

export const challengesAtom = atom<Challenge[]>([])

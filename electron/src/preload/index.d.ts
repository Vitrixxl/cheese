import { ElectronAPI } from '@electron-toolkit/preload'
import type { BetterGameTree } from '@shared'
import type { EvalOutput } from '../stockfish/main'
import type { GameTree } from '@/hooks/use-game-tree'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      stockfish: {
        evalGame: (game: string[]) => Promise<BetterGameTree | null>
      }
    }
  }
}

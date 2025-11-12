import { ElectronAPI } from '@electron-toolkit/preload'
import type { EvalOutput } from '../stockfish/main'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      stockfish: {
        evalFen: (fen: string) => Promise<EvalOutput | null>
        evalPgn: (pgn: string) => Promise<(EvalOutput | null)[] | null>
        evalPgnChill: (pgn: string) => Promise<(EvalOutput | null)[] | null>
      }
    }
  }
}

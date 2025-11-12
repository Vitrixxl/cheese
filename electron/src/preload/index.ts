import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { EvalOutput } from '../stockfish/main'

// Custom APIs for renderer
const api = {
  stockfish: {
    evalFen: (fen: string): Promise<EvalOutput | null> => {
      return ipcRenderer.invoke('stockfish:evalFen', fen)
    },
    evalPgn: (pgn: string): Promise<(EvalOutput | null)[] | null> => {
      return ipcRenderer.invoke('stockfish:evalPgn', pgn)
    },
    evalPgnChill: (pgn: string): Promise<(EvalOutput | null)[] | null> => {
      return ipcRenderer.invoke('stockfish:evalPgnChill', pgn)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

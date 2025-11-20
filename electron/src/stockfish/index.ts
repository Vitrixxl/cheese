import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import { Chess } from 'chess.js'
type MoveQuality =
  | 'brilliant' // !!
  | 'great' // !
  | 'best' // Meilleur coup
  | 'excellent'
  | 'good'
  | 'book' // Coup théorique
  | 'inaccuracy' // ?!
  | 'mistake' // ?
  | 'blunder' // ??
  | 'missed-win' // Victoire manquée

export type EvalScore = { type: 'cp'; value: number } | { type: 'mate'; value: number }
type GameTreeMove = {
  move: string
  bestMoves?: string[]
  moveQuality?: MoveQuality | null
  evaluation?: { cp?: number | null; mate?: number | null }
}

type GameTree = {
  whiteMove: GameTreeMove
  blackMove: GameTreeMove | null
  whiteVariations: GameTree[]
  blackVariations: GameTree[]
  index: number
  isMain: boolean
}[]

type EvalOutput = {
  bestMoves: string[]
  evaluation: { cp?: number | null; mate?: number | null }
  nextVariations: string[][]
}

export class Stockfish {
  private readonly stockfishPath = '/usr/sbin/stockfish'
  constructor() {}

  private readOutput = (
    proc: ChildProcessWithoutNullStreams,
    delimiter: RegExp,
  ): Promise<string[]> => {
    return new Promise<string[]>((resolve) => {
      const lines: string[] = []
      proc.stdout.on('data', (data: ArrayBufferLike) => {
        const chunk = data.toString()
        chunk.split(/\r?\n/).forEach((line: string) => {
          if (!line.trim()) return
          lines.push(line)
          if (delimiter.test(line)) {
            resolve(lines)
          }
        })
      })
    })
  }

  private getEngine = () => {
    const engine = spawn(this.stockfishPath, [], { stdio: 'pipe' })
    this.send(engine, 'uci')
    return engine
  }

  private send = (engine: ChildProcessWithoutNullStreams, cmd: string) => {
    engine.stdin.write(cmd + '\n')
  }

  // private getMoveQuality = (
  //   prevEval: Pick<EvalOutput, 'evaluation'>['evaluation'],
  //   currentNode: EvalOutput,
  //   move: string,
  //   moves: string[],
  // ): MoveQuality | null => {
  //   const chess = new Chess()
  //   moves.forEach((m) => chess.move(m))
  //
  //   const uciMove = `${move.from}${move.to}${move.promotion}`
  //   const isSacrifice = chess.moves().includes(move.san)
  //   if (isSacrifice && currentNode.bestMoves.includes(uciMove)) {
  //     return 'brilliant'
  //   }
  //   if (isSacrifice && !currentNode.bestMoves.includes(uciMove)) {
  //     return 'blunder'
  //   }
  //   if (prevEval.mate && !currentNode.evaluation.mate) {
  //     return 'blunder'
  //   }
  //   if (!prevEval.mate && currentNode.evaluation.mate) {
  //     return 'great'
  //   }
  //   if (currentNode.bestMoves[0] == uciMove) {
  //     return 'best'
  //   }
  //   if (prevEval.mate && currentNode.evaluation.mate) {
  //     const diff = Math.abs(currentNode.evaluation.mate) - Math.abs(prevEval.mate)
  //     if (diff >= 0) {
  //       return 'good'
  //     }
  //     return 'great'
  //   }
  //   if (!prevEval.cp || !currentNode.evaluation.cp) return null
  //   const diff = Math.abs(currentNode.evaluation.cp) - Math.abs(prevEval.cp)
  //   if (diff > 0) {
  //     return 'good'
  //   }
  //   if (diff < 20) {
  //     return 'inaccuracy'
  //   }
  //   if (diff < 30) {
  //     return 'mistake'
  //   }
  //   return 'blunder'
  // }
  //
  private parseStockfishOutput = (lines: string[], multiPv: number): EvalOutput => {
    const infoLines = lines.slice(lines.length - 1 - multiPv, lines.length - 1)
    const bestMoves: string[] = []
    const nextVariations: string[][] = []
    let cpScore = 0
    let mateScore: number | null = null
    console.log({ infoLines })

    infoLines.forEach((l) => {
      const splitedLine = l.split(' ')
      const scoreTypeIndex = splitedLine.indexOf('score') + 1
      const scoreIndex = splitedLine.indexOf('score') + 2
      const bestMoveIndex = splitedLine.indexOf('pv') + 1
      bestMoves.push(splitedLine[bestMoveIndex])
      nextVariations.push(splitedLine.slice(bestMoveIndex, l.length))
      const scoreType = splitedLine[scoreTypeIndex]
      const score = Number(splitedLine[scoreIndex])
      if (scoreType == 'mate') {
        mateScore = Number(score)
        return
      }
      if (Math.abs(score) > Math.abs(cpScore)) {
        cpScore = score
      }
    })

    return {
      bestMoves,
      evaluation: {
        mate: mateScore,
        cp: cpScore,
      },
      nextVariations,
    }
  }

  /**
   * This method take a UCI string array
   */
  private evalPosition = async (moves: string[]) => {
    console.log({
      moves,
    })
    const engine = this.getEngine()
    this.send(engine, `setoption name MultiPv value 1`)
    this.send(engine, `position startpos moves ${moves.join(' ')}`)
    const linesPromise = this.readOutput(engine, /^bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/)
    this.send(engine, `go depth 15`)
    const lines = await linesPromise
    engine.kill()
    return this.parseStockfishOutput(lines, 1)
  }

  evalGame = async (moves: string[], isMain: boolean, lastWhiteMove?: GameTreeMove) => {
    const root: GameTree = []
    const BATCH_SIZE = 4

    const pairIndices: number[] = []
    for (let i = 2; i <= moves.length + 1; i += 2) {
      pairIndices.push(i)
    }
    console.log({ pairIndices })

    if (lastWhiteMove) moves = ['null', ...moves]
    const batches: number[][] = []
    for (let i = 0; i < pairIndices.length; i += BATCH_SIZE) {
      batches.push(pairIndices.slice(i, i + BATCH_SIZE))
    }

    for (const batch of batches) {
      const results = await Promise.all(
        batch.map(async (i) => {
          const movesSlice = moves.slice(0, i)
          const hasBlack = movesSlice.length % 2 == 0
          const whiteMovesSlice = movesSlice.slice(0, movesSlice.length - 2)
          const blackMoveSlice = movesSlice.slice(0, movesSlice.length - 1)
          const index = i <= 4 ? Math.floor(i / 2) : Math.floor(i / 2) + 1

          if (isMain) {
            console.log({
              movesSlice,
              whiteMovesSlice,
              blackMoveSlice,
            })
          }

          const [whiteEval, blackEval] = isMain
            ? await Promise.all([
                this.evalPosition(whiteMovesSlice),
                hasBlack && this.evalPosition(blackMoveSlice),
              ])
            : [null, null]

          const lastMoves = movesSlice.slice(
            hasBlack ? movesSlice.length - 2 : movesSlice.length - 1,
          )

          const whiteGameTreeMove: GameTreeMove = whiteEval
            ? {
                move: lastMoves[0],
                bestMoves: whiteEval.bestMoves,
                evaluation: whiteEval.evaluation,
              }
            : lastMoves[0] == 'null' && lastWhiteMove
              ? lastWhiteMove
              : {
                  move: lastMoves[0],
                }
          const blackGameTreeMove: GameTreeMove | null = hasBlack
            ? blackEval
              ? {
                  move: lastMoves[1],
                  bestMoves: blackEval.bestMoves,
                  evaluation: blackEval.evaluation,
                }
              : {
                  move: lastMoves[1],
                }
            : null

          let whiteVariations: GameTree[] = []
          let blackVariations: GameTree[] = []
          if (whiteEval) {
            for (const e of whiteEval.nextVariations) {
              const tree = await this.evalGame(e, false)
              whiteVariations.push(tree)
            }
          }
          if (blackEval) {
            for (const e of blackEval.nextVariations) {
              const tree = await this.evalGame(e, false, whiteGameTreeMove)
              blackVariations.push(tree)
            }
          }

          return {
            whiteMove: whiteGameTreeMove,
            blackMove: blackGameTreeMove,
            whiteVariations,
            blackVariations,
            index,
            isMain: isMain,
          }
        }),
      )

      root.push(...results)
    }
    return root
  }
  naturalToUci = (moves: string[]) => {
    const chess = new Chess()
    const uciMoves: string[] = []
    moves.forEach((m) => {
      const result = chess.move(m)
      if (result) {
        uciMoves.push(result.from + result.to + (result.promotion || ''))
      }
    })
    return uciMoves
  }
}

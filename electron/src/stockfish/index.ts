import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import { Chess } from 'chess.js'
import { exit } from 'node:process'
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

export type GameTree = {
  move: string | null
  isMain: boolean
  eval?: {
    bestMove: string
    moveQuality: MoveQuality
    evalScore: EvalScore
  }
  variations: GameTree[]
  index: number
}

export type EvalScore = { type: 'cp'; value: number } | { type: 'mate'; value: number }

export class Stockfish {
  private readonly stockfishPath = '/usr/sbin/stockfish'
  constructor() {}

  private getMoveQuality = (
    prevEval: Pick<EvalOutput, 'evaluation'>['evaluation'],
    currentNode: EvalOutput,
    moves: string[]
  ): MoveQuality | null => {
    if (!currentNode.move) return null
    const chess = new Chess()
    moves.forEach((m) => chess.move(m))
    const move = chess.move(currentNode.move)

    const uciMove = `${move.from}${move.to}${move.promotion}`
    const isSacrifice = chess.moves().includes(move.san)
    if (isSacrifice && currentNode.bestMoves.includes(uciMove)) {
      return 'brilliant'
    }
    if (isSacrifice && !currentNode.bestMoves.includes(uciMove)) {
      return 'blunder'
    }
    if (prevEval.mate && !currentNode.evaluation.mate) {
      return 'blunder'
    }
    if (!prevEval.mate && currentNode.evaluation.mate) {
      return 'great'
    }
    if (currentNode.bestMoves[0] == uciMove) {
      return 'best'
    }
    if (prevEval.mate && currentNode.evaluation.mate) {
      const diff = Math.abs(currentNode.evaluation.mate) - Math.abs(prevEval.mate)
      if (diff >= 0) {
        return 'good'
      }
      return 'great'
    }
    if (!prevEval.cp || !currentNode.evaluation.cp) return null
    const diff = Math.abs(currentNode.evaluation.cp) - Math.abs(prevEval.cp)
    if (diff > 0) {
      return 'good'
    }
    if (diff < 20) {
      return 'inaccuracy'
    }
    if (diff < 30) {
      return 'mistake'
    }
    return 'blunder'
  }
  private readOutput = (
    proc: ChildProcessWithoutNullStreams,
    delimiter: RegExp
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

  private naturalToUci = (moves: string[]) => {
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
  private parseStockfishOutput = (lines: string[], multiPv: number): Omit<EvalOutput, 'move'> => {
    const infoLines = lines.slice(lines.length - 1 - multiPv, lines.length - 1)
    const bestMoves: string[] = []
    const nextVariations: string[][] = []
    let cpScore = 0
    let mateScore: number | null = null

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
        cp: cpScore
      },
      nextVariations
    }
  }

  /**
   * This method take a UCI string array
   */
  private evalPosition = async (moves: string[]) => {
    const engine = this.getEngine()
    this.send(engine, `setoption name MultiPv value 1`)
    this.send(engine, `position startpos moves ${moves.join(' ')}`)
    const linesPromise = this.readOutput(engine, /^bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/)
    this.send(engine, `go depth 10`)
    const lines = await linesPromise
    return this.parseStockfishOutput(lines, 1)
  }

  private buildComputedBranch = (computedVariation: string[]): BetterGameTree => {
    const restVariation = computedVariation.slice(1)
    return {
      move: computedVariation[0],
      nextVariation: restVariation.length == 0 ? [] : [this.buildComputedBranch(restVariation)],
      isMain: false
    }
  }
  private buildTree = (evals: EvalOutput[]): BetterGameTree => {
    const firstNode = evals[0]
    const root: BetterGameTree = {
      move: null,
      nextVariation: [],
      evaluation: firstNode.evaluation,
      bestMoves: firstNode.bestMoves,
      isMain: true
    }
    let current = root

    const movesList: string[] = []
    for (const e of evals.slice(1)) {
      const nodeVariations: BetterGameTree[] = []
      console.log({ move: e.move })
      for (const variation of e.nextVariations) {
        nodeVariations.push(this.buildComputedBranch(variation))
      }
      const newNode: BetterGameTree = {
        move: e.move,
        evaluation: e.evaluation,
        bestMoves: e.bestMoves,
        moveQuality: current.evaluation
          ? this.getMoveQuality(current.evaluation, e, movesList)
          : null,
        nextVariation: nodeVariations,
        isMain: true
      }
      current.nextVariation = [newNode, ...current.nextVariation]
      current = newNode
      if (newNode.move) {
        movesList.push(newNode.move)
      }
    }

    return root
  }
  evalGame = async (moves: string[]) => {
    const evals: EvalOutput[] = []
    for (let i = 0; i <= moves.length; i++) {
      const movesSlice = moves.slice(0, i)
      console.log({ movesSlice })
      const parsedMoves = this.naturalToUci(movesSlice)
      const evalResult = await this.evalPosition(parsedMoves)
      const moveForNode = moves[i - 1]
      evals.push({ ...evalResult, move: moveForNode })
    }

    const gameTree = this.buildTree(evals)
    console.log(JSON.stringify(gameTree, null, 2))

    return gameTree
  }
}

type BetterGameTree = {
  move: string | null
  bestMoves?: string[]
  moveQuality?: MoveQuality | null
  evaluation?: { cp?: number | null; mate?: number | null }
  nextVariation: BetterGameTree[]
  isMain: boolean
}
type EvalOutput = {
  move: string | null
  bestMoves: string[]
  evaluation: { cp?: number | null; mate?: number | null }
  nextVariations: string[][]
}

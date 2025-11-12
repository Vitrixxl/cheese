import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process'

export type EvalScore = { type: 'cp'; value: number } | { type: 'mate'; value: number }

export type EvalOutput = {
  bestMove: string
  sequence: string[]
  eval: EvalScore
}

export class Stockfish {
  private readonly stockfishPath = '/usr/sbin/stockfish'
  constructor() {}

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

  private parseInfo = (line: string) => {
    if (!line.startsWith('info ')) return null
    const parts = line.trim().split(/\s+/)
    const out: { depth: number | null; score: EvalScore | null; pv: string | null } = {
      depth: null,
      score: null,
      pv: null
    }

    for (let i = 0; i < parts.length; i++) {
      const tok = parts[i]
      if (tok === 'depth' && i + 1 < parts.length) out.depth = Number(parts[++i])
      else if (tok === 'score' && i + 2 < parts.length) {
        const type = parts[++i] as 'cp' | 'mate'
        const value = Number(parts[++i])
        out.score = { type, value }
      } else if (tok === 'pv') {
        out.pv = parts.slice(i + 1).join(' ')
        break
      }
    }
    if (out.depth == null || out.score == null || out.pv == null) return null
    return out as { depth: number; score: EvalScore; pv: string }
  }

  private getEngine = () => {
    const engine = spawn(this.stockfishPath, [], { stdio: 'pipe' })
    this.send(engine, 'uci')
    return engine
  }
  private send = (engine: ChildProcessWithoutNullStreams, cmd: string) => {
    engine.stdin.write(cmd + '\n')
  }

  parsePgn = (pgn: string) => {
    const cleaned = pgn
      .replace(/\{[^}]*\}/g, ' ')
      .replace(/\b\d+\.(?:\.\.)?/g, ' ')
      .replace(/\b1-0\b|\b0-1\b|\b1\/2-1\/2\b|\*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const moves: string[][] = []
    const rawMoves = cleaned.split(' ')

    for (let i = 0; i < rawMoves.length; i += 2) {
      moves.push([rawMoves[i], rawMoves[i + 1]])
    }
    return moves
  }
  toPgn = (parsedPgn: string[][]) => {
    let pgnStr = ''
    let i = 1
    for (const moves of parsedPgn) {
      pgnStr += ` ${i}.`
      moves.forEach((m) => {
        if (!m) return
        pgnStr += `${m} `
      })
      i++
    }
    return pgnStr
  }

  evalFen = async (fen: string): Promise<EvalOutput | null> => {
    const engine = this.getEngine()
    this.send(engine, `position fen ${fen}`)
    const linesPromise = this.readOutput(engine, /^bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/)
    this.send(engine, `go movetime 500`)
    const lines = await linesPromise
    if (lines.length <= 2) return null
    const lastLine = lines[lines.length - 1]
    const lastInfoLine = lines[lines.length - 2]
    const parsedInfo = this.parseInfo(lastInfoLine)
    if (!parsedInfo) return null
    return {
      bestMove: lastLine.split(' ')[1],
      sequence: parsedInfo!.pv!.split(' '),
      eval: parsedInfo.score
    }
  }
  evalPgn = async (pgn: string): Promise<(EvalOutput | null)[] | null> => {
    const parsedPgn = this.parsePgn(pgn)
    const result = await Promise.all(
      Array.from({ length: parsedPgn.length }).map(async (_, i) => {
        const slice = parsedPgn.slice(1, Math.max(i, 1))

        const engine = this.getEngine()
        this.send(engine, `position startpos moves ${slice.flat().join(' ')}`)
        const linesPromise = this.readOutput(engine, /^bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/)
        this.send(engine, `go depth 10`)
        const lines = await linesPromise
        if (lines.length <= 2) return null
        const lastLine = lines[lines.length - 1]
        const lastInfoLine = lines[lines.length - 2]
        const parsedInfo = this.parseInfo(lastInfoLine)
        if (!parsedInfo) return null
        return {
          bestMove: lastLine.split(' ')[1],
          sequence: parsedInfo.pv.split(' '),
          eval: parsedInfo.score
        }
      })
    )

    return result
  }
  evalPgnChill = async (pgn: string): Promise<(EvalOutput | null)[] | null> => {
    const parsedPgn = this.parsePgn(pgn)
    const result: (EvalOutput | null)[] = []
    for (let i = 0; i <= parsedPgn.length; i += 5) {
      const slicesResult = await Promise.all(
        Array.from({ length: 5 }).map(async (_, i) => {
          const slice = parsedPgn.slice(1, Math.max(i, 1))

          const engine = this.getEngine()
          this.send(engine, `position startpos moves ${slice.flat().join(' ')}`)
          const linesPromise = this.readOutput(engine, /^bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/)
          this.send(engine, `go depth 10`)
          const lines = await linesPromise
          engine.kill()
          if (lines.length <= 2) return null
          const lastLine = lines[lines.length - 1]
          const lastInfoLine = lines[lines.length - 2]
          const parsedInfo = this.parseInfo(lastInfoLine)
          if (!parsedInfo) return null
          return {
            bestMove: lastLine.split(' ')[1],
            sequence: parsedInfo.pv.split(' '),
            eval: parsedInfo.score
          }
        })
      )
      slicesResult.forEach((r) => {
        slicesResult.push(r)
      })
    }
    return result
  }
}

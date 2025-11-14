import type { BetterGameTree } from '@shared'
import { chessHistoryAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type MovePair = {
  index: number
  whiteMove: BetterGameTree
  whiteBranches: MovePair[][] // Array of variation lines
  blackMove?: BetterGameTree | null // Optional if no black response
  blackBranches: MovePair[][] // Array of variation lines
}

/**
 * Transforms a GameTree (from Stockfish) into a flat array of MovePairs for display
 */

function transformToMovePairs(tree: BetterGameTree): MovePair[] {
  const pairs: MovePair[] = []
  if (tree.nextVariation.length == 0) {
    return []
  }
  let current: BetterGameTree | null = tree
  let currentIndex = 0
  while (current && current.nextVariation.length > 0) {
    const white = current.nextVariation.length >= 1 ? current.nextVariation[0] : null
    if (!white) {
      current = null
      return pairs
    }
    const black = white.nextVariation.length >= 1 ? white.nextVariation[0] : null
    pairs.push({
      index: currentIndex,
      whiteMove: white,
      blackMove: black,
      blackBranches: [],
      whiteBranches: []
    })
    if (black && black.nextVariation.length > 0 && black.nextVariation[0].isMain) {
      current = black.nextVariation[0]
      currentIndex++
      continue
    }
    current = null
  }
  return pairs
}

type GameTreeComponentProps = {
  pairs: MovePair[]
  moveNumber: number
  isRoot: boolean
}

function GameTreeComponent({ pairs, isRoot }: GameTreeComponentProps) {
  if (!pairs || pairs.length === 0) return null

  return (
    <div className={cn('flex', isRoot ? 'flex-col' : 'flex-wrap gap-1')}>
      {pairs.map(({ whiteMove, blackMove, whiteBranches, blackBranches, index }) => (
        <div key={index} className="flex flex-col gap-1">
          {/* Main move pair */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground min-w-8 text-sm">{index}.</span>
            <div className="text-foreground bg-background hover:bg-accent cursor-pointer rounded-lg border px-2 py-1 text-sm">
              {whiteMove.move}
            </div>
            {blackMove && (
              <div className="text-foreground bg-background hover:bg-accent cursor-pointer rounded-lg border px-2 py-1 text-sm">
                {blackMove.move}
              </div>
            )}
          </div>

          {/* White variations */}
          {whiteBranches.length > 0 &&
            whiteBranches.map((branch, i) => (
              <div key={i} className="border-muted ml-8 border-l-2 pl-2">
                <p className="text-muted-foreground mb-1 text-xs">Variation {i + 1}:</p>
                <GameTreeComponent pairs={branch} moveNumber={index} isRoot={false} />
              </div>
            ))}

          {/* Black variations */}
          {blackBranches.length > 0 &&
            blackBranches.map((branch, i) => (
              <div key={i} className="border-muted ml-8 border-l-2 pl-2">
                <p className="text-muted-foreground mb-1 text-xs">Variation {i + 1}:</p>
                <GameTreeComponent pairs={branch} moveNumber={index + 1} isRoot={false} />
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}

export default function GameTreeMain() {
  const [gameTree, setGameTree] = useState<BetterGameTree | null>(null)

  const history = useAtomValue(chessHistoryAtom)

  const analyse = async () => {
    const gameTree = await window.api.stockfish.evalGame(history)
    setGameTree(gameTree)
  }

  if (!gameTree || gameTree.nextVariation.length == 0) {
    return (
      <Card className="w-lg">
        <CardHeader>
          <CardTitle>Analysis</CardTitle>
          <CardDescription>
            Navigate through your game and explore the paths that you missed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => analyse()}>Analyse</Button>
        </CardContent>
      </Card>
    )
  }

  //
  const movePairs = transformToMovePairs(gameTree)
  //
  console.log({ movePairs })

  return (
    <Card className="w-lg">
      <CardHeader>
        <CardTitle>Analysis</CardTitle>
        <CardDescription>
          Navigate through your game and explore the paths that you missed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="max-h-[600px] overflow-y-auto">
            <GameTreeComponent pairs={movePairs} moveNumber={1} isRoot={true} />
          </div>
          <Button onClick={() => analyse()}>Analyse</Button>
        </div>
      </CardContent>
    </Card>
  )
}

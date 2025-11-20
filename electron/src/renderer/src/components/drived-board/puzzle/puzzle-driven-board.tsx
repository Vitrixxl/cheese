import Board from '@/components/board'
import Protected from '@/components/protected'
import { useBoardController } from '@/hooks/use-board-controller'
import { useNextPuzzle, usePuzzle } from '@/hooks/use-puzzle'
import React from 'react'
import type { LocalMove } from '@/types'
import { Chess } from 'chess.js'
import FinishedPuzzleDialog from './finished-dialog-puzzle'
import BoardContainer from '@/components/board-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PuzzleDrivenBoard() {
  const { data, isLoading } = usePuzzle()
  const { isLoading: isNextLoading, fetchNext } = useNextPuzzle()
  const [isOpen, setIsOpen] = React.useState(false)
  const movesRef = React.useRef<string[]>([])
  const movesCountRef = React.useRef(1)
  const { applyLocalMove, selectSquare, setHover, loadFen, chess } = useBoardController()

  const handleMove = (m: LocalMove) => {
    const clone = new Chess(chess.fen())
    const move = clone.move(m)
    const rightMove = movesRef.current[movesCountRef.current]
    console.log(rightMove)
    if (move.lan != rightMove) {
      return
    }

    applyLocalMove(m)
    movesCountRef.current++
    if (movesCountRef.current == movesRef.current.length) {
      setIsOpen(true)
      return
    }

    setTimeout(() => {
      applyLocalMove(movesRef.current[movesCountRef.current])
      movesCountRef.current++
    }, 200)
  }
  React.useEffect(() => {
    if (!data) return
    loadFen(data.fen)
    const moves = data.moves.split(' ')
    applyLocalMove(moves[0])
    movesRef.current = moves
    movesCountRef.current = 1
  }, [data])

  return (
    <Protected>
      <BoardContainer
        board={
          <Board
            loading={isLoading || isNextLoading}
            onSelect={selectSquare}
            onHover={setHover}
            onMove={handleMove}
            playerColor={data?.color == 'w' ? 'b' : 'w'}
          />
        }
        sideBoard={
          <Card>
            <CardHeader>
              <CardTitle>Puzzle : {data?.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {data && data.themes.split(' ').map((t) => <Badge>{t}</Badge>)}
              </div>
            </CardContent>
          </Card>
        }
      />

      <FinishedPuzzleDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        onNext={() => {
          setIsOpen(false)
          fetchNext()
        }}
      />
    </Protected>
  )
}

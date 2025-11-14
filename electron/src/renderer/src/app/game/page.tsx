import Board from '@/components/board'
import BoardContainer from '@/components/board-container'
import { useBoardController } from '@/hooks/use-board-controller'
import { useParams } from 'react-router'

export default function GamePage() {
  const { gameId } = useParams()
  if (!gameId) return null
  const { applyLocalMove, selectSquare, setHover } = useBoardController()

  return (
    <BoardContainer
      board={
        <Board
          playerColor={null}
          onMove={applyLocalMove}
          onSelect={selectSquare}
          onHover={setHover}
        />
      }
      sideBoard={<div></div>}
    />
  )
}

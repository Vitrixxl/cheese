import Board from '@/components/board'
import BoardContainer from '../board-container'
import { useBoardController } from '@/hooks/use-board-controller'

export default function LocalDrivenBoard() {
  const { selectSquare, setHover, applyLocalMove } = useBoardController()

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
    />
  )
}

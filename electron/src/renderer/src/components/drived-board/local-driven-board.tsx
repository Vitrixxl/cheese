import Board from '@/components/board'
import { useBoardDriver } from '@/hooks/use-board-driver'
import BoardContainer from '../board-container'
import GameTreeComponent from '../game-tree'

export default function LocalDrivenBoard() {
  const { controller, playMove } = useBoardDriver({ id: 'local' })

  return (
    <BoardContainer
      board={
        <Board
          playerColor={null}
          onMove={playMove}
          onSelect={controller.selectSquare}
          onHover={controller.setHover}
        />
      }
      sideBoard={<GameTreeComponent />}
    />
  )
}

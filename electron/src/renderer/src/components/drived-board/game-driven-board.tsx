import Board from '@/components/board'
import { colorAtom, gameCategoryAtom, initialTimerAtom, playersAtom } from '@/store'
import {
  hintMovesAtom,
  hoverSquareAtom,
  selectedSquareAtom,
  uiChessBoardAtom
} from '@/store/chess-board'
import { gameWsAtom } from '@/store/ws'
import type { ChessClientMessage } from '@game-server/types/schema'
import { useAtomValue } from 'jotai'
import Timer from '../timer'
import { BoardHistory } from '../board-history'
import type { LocalMove } from '@/types'
import { useBoardController } from '@/hooks/use-board-controller'
import Protected from '../protected'
import BoardContainer from '../board-container'
import { TIME_CONTROL_INCREMENTS } from '@shared'
import EndGameDialog from './game/end-game-dialog'

export default function GameDrivenBoard() {
  const ws = useAtomValue(gameWsAtom)
  const color = useAtomValue(colorAtom)
  const initialTimer = useAtomValue(initialTimerAtom)
  const players = useAtomValue(playersAtom)
  const { applyLocalMove, selectSquare, setHover } = useBoardController()

  const board = useAtomValue(uiChessBoardAtom)
  const moves = useAtomValue(hintMovesAtom)
  const hover = useAtomValue(hoverSquareAtom)
  const selected = useAtomValue(selectedSquareAtom)
  const gameCategory = useAtomValue(gameCategoryAtom)
  const handleMove = (move: LocalMove) => {
    if (!ws) return
    ws.send({
      key: 'move',
      payload: {
        move
      }
    } satisfies ChessClientMessage)
    applyLocalMove(move)
  }
  if (!ws || players.length != 2) return
  return (
    <Protected>
      <BoardContainer
        board={
          <div className="grid h-fit max-h-full max-w-full min-w-0 grid-cols-1 grid-rows-[0fr_auto_0fr] gap-4">
            <div className="flex w-full justify-between">
              <Timer
                initialTimer={initialTimer}
                color={color == 'w' ? 'b' : 'w'}
                increment={
                  gameCategory?.timeControl ? TIME_CONTROL_INCREMENTS[gameCategory.timeControl] : 0
                }
              />
            </div>

            <Board
              board={board}
              moves={moves}
              hover={hover}
              selected={selected}
              playerColor={color || 'w'}
              onMove={handleMove}
              onSelect={selectSquare}
              onHover={setHover}
            />
            <Timer
              initialTimer={initialTimer}
              color={color == 'w' ? 'w' : 'b'}
              increment={
                gameCategory?.timeControl ? TIME_CONTROL_INCREMENTS[gameCategory.timeControl] : 0
              }
            />
          </div>
        }
        sideBoard={<BoardHistory />}
      />
      <EndGameDialog />
    </Protected>
  )
}

import Board from '@/components/board'
import { colorAtom, playersAtom } from '@/store'
import { gameWsAtom } from '@/store/ws'
import type { ChessClientMessage } from '@game-server/types/schema'
import { useAtomValue } from 'jotai'
import Timer from '../timer'
import { BoardHistory } from '../board-history'
import type { LocalMove } from '@/types'
import { useBoardController } from '@/hooks/use-board-controller'
import Protected from '../protected'
import BoardContainer from '../board-container'
import EndGameDialog from './game/end-game-dialog'
import { useGameTimer } from '@/hooks/use-game-timer'

export default function GameDrivenBoard() {
  const ws = useAtomValue(gameWsAtom)
  const color = useAtomValue(colorAtom)
  const players = useAtomValue(playersAtom)
  const { applyLocalMove, selectSquare, setHover } = useBoardController()
  useGameTimer()

  const handleMove = (move: LocalMove) => {
    if (!ws) return
    ws.send({
      key: 'move',
      payload: {
        move,
      },
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
              <Timer color={color == 'w' ? 'b' : 'w'} />
            </div>

            <Board
              playerColor={color || 'w'}
              onMove={handleMove}
              onSelect={selectSquare}
              onHover={setHover}
            />
            <Timer color={color == 'w' ? 'w' : 'b'} />
          </div>
        }
        sideBoard={<BoardHistory />}
      />
      <EndGameDialog />
    </Protected>
  )
}

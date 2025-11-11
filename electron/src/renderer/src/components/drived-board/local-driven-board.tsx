import Board from '@/components/board'
import { useBoardDriver } from '@/hooks/use-board-driver'
import {
  hintMovesAtom,
  hoverSquareAtom,
  selectedSquareAtom,
  uiChessBoardAtom
} from '@/store/chess-board'
import { useAtomValue } from 'jotai'
import { BoardHistory } from '../board-history'
import React from 'react'

export default function LocalDrivenBoard() {
  const { controller, playMove } = useBoardDriver({ id: 'local' })
  const board = useAtomValue(uiChessBoardAtom)
  const moves = useAtomValue(hintMovesAtom)
  const hover = useAtomValue(hoverSquareAtom)
  const selected = useAtomValue(selectedSquareAtom)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const historyRef = React.useRef<HTMLDivElement>(null)
  const [boardSize, setBoardSize] = React.useState<number>(0)

  const MAX_WIDTH = 1600
  React.useEffect(() => {
    const container = containerRef.current
    const history = historyRef.current
    if (!container || !history) return
    const parent = container.parentElement
    if (!parent) return

    const updateSize = () => {
      const parentWidth = parent.clientWidth
      const containerHeight = container.clientHeight
      const historyWidth = history.clientWidth

      // gap-4 = 1rem = 16px
      const gap = 16
      const padding = 32
      const spacing = gap + padding
      const availableWidth =
        Math.min(MAX_WIDTH, parentWidth) - historyWidth - (MAX_WIDTH > parentWidth ? spacing : gap)
      const availableHeight = containerHeight

      const size = Math.min(availableWidth, availableHeight)
      setBoardSize(size)
    }

    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(parent)
    resizeObserver.observe(container)
    resizeObserver.observe(history)
    updateSize()

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div
      className="grid grid-rows-2 grid-cols-1 xl:grid-rows-none xl:grid-cols-[auto_auto] gap-4  mx-auto h-full items-start w-full"
      style={{
        maxWidth: MAX_WIDTH
      }}
      ref={containerRef}
    >
      <Board
        board={board}
        moves={moves}
        hover={hover}
        selected={selected}
        playerColor={null}
        onMove={playMove}
        onSelect={controller.selectSquare}
        onHover={controller.setHover}
        size={boardSize}
      />
      <div ref={historyRef}>
        <BoardHistory />
      </div>
    </div>
  )
}

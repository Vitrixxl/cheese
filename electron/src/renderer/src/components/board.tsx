import type { Square, Color } from 'chess.js'
import {
  boardAtom,
  hintMovesAtom,
  hoverSquareAtom,
  piecesAtom,
  selectedSquareAtom,
} from '@/store/chess-board'
import Piece from './piece'
import { cn } from '@/lib/utils'
import type { LocalMove } from '@/types/chess'
import React from 'react'
import Promotion from './promotion'
import { useAtomValue } from 'jotai'
import { turnAtom } from '@/store'
import { LucideLoaderCircle } from 'lucide-react'

const fileLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const rankNumbers = [8, 7, 6, 5, 4, 3, 2, 1]

const Crosshair = ({
  variant = 'selected',
  hasSquare,
}: {
  variant?: 'selected' | 'move'
  hasSquare?: boolean
}) => (
  <div
    className={cn(
      'pointer-events-none absolute grid size-full',
      variant === 'selected'
        ? 'inset-0 grid-cols-[0.90fr_0.5fr_0.90fr] grid-rows-[0.90fr_0.5fr_0.90fr] p-2'
        : cn(
            'grid-cols-[0.25fr_1fr_0.25fr] grid-rows-[0.25fr_1fr_0.25fr]',
            hasSquare
              ? 'inset-0 p-2'
              : 'top-1/2 left-1/2 size-2/4 -translate-1/2 grid-cols-[1fr_1fr_1fr] grid-rows-[1fr_1fr_1fr]',
          ),
    )}
  >
    <div className="border-background/50 col-start-1 row-start-1 rounded-tl-xl border-t-[6px] border-l-[6px]" />
    <div className="border-background/50 col-start-3 row-start-1 rounded-tr-xl border-t-[6px] border-r-[6px]" />
    <div className="border-background/50 col-start-1 row-start-3 rounded-bl-xl border-b-[6px] border-l-[6px]" />
    <div className="border-background/50 col-start-3 row-start-3 rounded-br-xl border-r-[6px] border-b-[6px]" />
  </div>
)

export type BoardProps = {
  playerColor: Color | null
  loading?: boolean
  size?: number
  onSelect: (square: Square | null) => any
  onHover: (square: Square | null) => any
  onMove: (move: LocalMove) => any
}

export default function Board({ playerColor, loading, onSelect, onHover, onMove }: BoardProps) {
  const board = useAtomValue(boardAtom)
  const moves = useAtomValue(hintMovesAtom)
  const hover = useAtomValue(hoverSquareAtom)
  const selected = useAtomValue(selectedSquareAtom)
  const boardRef = React.useRef<HTMLDivElement | null>(null)
  const pieces = useAtomValue(piecesAtom)
  const [needPromotion, setNeedPromotion] = React.useState<(LocalMove & { color: Color }) | null>(
    null,
  )

  const turn = useAtomValue(turnAtom)

  const files = playerColor === 'b' ? [...fileLetters].reverse() : fileLetters
  const ranks = playerColor === 'b' ? [...rankNumbers].reverse() : rankNumbers
  const displayBoard =
    playerColor === 'b' ? board.map((rank) => [...rank].reverse()).reverse() : board

  return (
    <div
      className="relative grid aspect-square max-h-full max-w-full grid-cols-8 grid-rows-8 overflow-hidden rounded-2xl border bg-gray-800 select-none"
      ref={boardRef}
      onContextMenuCapture={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
    >
      {displayBoard.map((rank, rankIndex) =>
        rank.map((square, fileIndex) => {
          const squareName = `${files[fileIndex]}${ranks[rankIndex]}` as Square
          let isDark = (rankIndex + fileIndex) % 2 === 1

          const isSelected = selected && (selected === squareName || hover === squareName)
          const isAvailableMove =
            moves.some((move) => move.to === squareName) && hover !== squareName
          const showCrosshair = isSelected || isAvailableMove
          const crosshairVariant = isSelected ? 'selected' : 'move'

          return (
            <div
              key={squareName}
              data-square={squareName}
              className={cn(
                'relative flex aspect-square items-center justify-center shadow-lg',
                isDark ? 'bg-black-square' : 'bg-white-square',
                hover && hover == square?.square && 'shadow-inner',
              )}
              onClick={() => !square && onSelect(null)}
            >
              {showCrosshair && <Crosshair variant={crosshairVariant} hasSquare={!!square} />}
              {selected && moves.some((move) => move.to === squareName) && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center bg-transparent p-2"
                  onClickCapture={() => {
                    const move = moves.find((m) => m.to == squareName)!
                    if (move.isPromotion()) {
                      setNeedPromotion({ ...move, color: turn })
                      return
                    }
                    onMove({ from: selected, to: squareName })
                  }}
                />
              )}
              <Promotion
                needPromotion={needPromotion}
                setNeedPromotion={setNeedPromotion}
                onMove={onMove}
                boardRef={boardRef}
                squareName={squareName}
                rankIndex={rankIndex}
                ranks={ranks}
                playerColor={playerColor ? playerColor : 'w'}
              />
            </div>
          )
        }),
      )}
      {pieces.map((p) => {
        return (
          <Piece
            key={p.key}
            piece={p}
            playerColor={playerColor}
            boardRef={boardRef}
            onHover={onHover}
            onMove={(m) => {
              const move = moves.find((move) => move.to == m.to && move.from == m.from)!
              if (!move) return
              if (move.isPromotion()) {
                setNeedPromotion({ ...m, color: p.color })
                return
              }
              onMove(m)
            }}
            onSelect={onSelect}
          />
        )
      })}
      {loading && (
        <div className="bg-background/30 absolute inset-0 grid place-content-center">
          <LucideLoaderCircle className="size-14 animate-spin" />
        </div>
      )}
    </div>
  )
}

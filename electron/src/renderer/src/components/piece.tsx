import { useBoardDrag } from '@/hooks/use-board-drag'
import { createPortal } from 'react-dom'
import { cn, pieceImgMap } from '@/lib/utils'
import { type Square, type Color } from 'chess.js'
import React from 'react'
import type { LocalMove } from '@/types/chess'
import type { Piece } from '@/lib/chessinator'

type PieceProps = {
  piece: Piece
  playerColor: Color | null
  onSelect: (square: Square | null) => void
  onHover: (square: Square | null) => void
  onMove: (move: LocalMove) => void
  boardRef: React.RefObject<HTMLDivElement | null>
}
const fileLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const rankNumbers = [8, 7, 6, 5, 4, 3, 2, 1]

export default function Piece({
  piece,
  boardRef,
  playerColor,
  onSelect,
  onHover,
  onMove,
}: PieceProps) {
  const ref = React.useRef<HTMLImageElement | null>(null)
  const src = pieceImgMap[piece.type][piece.color]

  const { isDragging, coordinates, dragSize } = useBoardDrag({
    pieceRef: ref,
    boardRef,
    color: piece.color,
    playerColor,
    square: piece.position,
    onMove,
    onHover,
  })

  React.useEffect(() => {
    if (isDragging && (!playerColor || playerColor == piece.color)) onSelect(piece.position)
  }, [isDragging])

  const fileIndex = fileLetters.indexOf(piece.position[0])
  const rankNumber = parseInt(piece.position[1])
  const rankIndex = rankNumbers.indexOf(rankNumber)

  const displayFileIndex = playerColor === 'b' ? 7 - fileIndex : fileIndex
  const displayRankIndex = playerColor === 'b' ? 7 - rankIndex : rankIndex

  const top = `calc((100% * ${displayRankIndex} / 8) + 1.25%)`
  const left = `calc((100% * ${displayFileIndex} / 8) + 1.25%)`

  const img = (
    <img
      src={src}
      draggable={false}
      className={cn(
        isDragging
          ? 'fixed z-10 -translate-1/2'
          : 'absolute size-[10%] transition-all duration-200',
      )}
      style={{
        left: coordinates ? coordinates.x + 'px' : left,
        top: coordinates ? coordinates.y + 'px' : top,
        maxWidth: dragSize || '10%',
        maxHeight: dragSize || '10%',
      }}
      ref={ref}
    />
  )

  if (isDragging && coordinates) {
    return createPortal(img, document.body)
  }

  return img
}

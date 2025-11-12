import React from 'react'

type BoardContainerProps = {
  board: React.ReactNode
  sideBoard?: React.ReactNode
}
export default function BoardContainer({ board, sideBoard }: BoardContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [styleWidth, setStyleWidth] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Find the board element by looking for aspect-square class
    // This works even if the board is nested inside other elements
    const boardEl = container.querySelector('.aspect-square') as HTMLDivElement | null
    if (!boardEl) return

    const measure = () => {
      const prev = container.style.width
      container.style.width = '100%'

      const containerW = container.clientWidth
      const boardW = boardEl.offsetWidth

      if (boardW < containerW) {
        setStyleWidth(`${boardW}px`)
      } else {
        setStyleWidth(undefined)
      }

      container.style.width = prev
    }

    measure()

    window.addEventListener('resize', measure)

    return () => {
      window.removeEventListener('resize', measure)
    }
  }, [])
  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4 xl:flex-row">
      <div className="w-full max-w-full" ref={containerRef} style={{ width: styleWidth ?? '100%' }}>
        {board}
      </div>
      <div className="shrink-0">{sideBoard}</div>
    </div>
  )
}

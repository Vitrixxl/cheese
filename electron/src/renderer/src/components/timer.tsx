import { cn } from '@/lib/utils'
import { turnAtom } from '@/store'
import type { Color } from 'chess.js'
import { useAtomValue } from 'jotai'
import React from 'react'

type TimerPros = {
  color: Color
  initialTimer: number
  increment: number
}
export const formatTimer = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  let hours = Math.floor(totalSeconds / 3600).toString()
  if (hours.length == 1) {
    hours = `0${hours}`
  }
  let minutes = Math.floor((totalSeconds % 3600) / 60).toString()
  if (minutes.length == 1) {
    minutes = `0${minutes}`
  }
  let seconds = (totalSeconds % 60).toString()
  if (seconds.length == 1) {
    seconds = `0${seconds}`
  }
  let tenths = Math.floor((ms % 1000) / 10).toString()
  if (tenths.length == 1) {
    tenths = `0${tenths}`
  }

  return { hours, minutes, seconds, tenths }
}

export default function Timer({ color, initialTimer, increment }: TimerPros) {
  const [timer, setTimer] = React.useState(initialTimer)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const lastDelta = React.useRef<number>(performance.now())
  const previousTurn = React.useRef<Color | null>(null)
  const turn = useAtomValue(turnAtom)

  React.useEffect(() => {
    // Ajouter l'incrément seulement si le tour vient de changer de moi vers l'adversaire
    if (turn && turn != color && previousTurn.current === color) {
      setTimer((prev) => prev + increment)
    }
    previousTurn.current = turn

    if (turn != color && intervalRef.current) {
      clearInterval(intervalRef.current)
      return
    }
    lastDelta.current = performance.now()
    const interval = setInterval(() => {
      const now = performance.now()
      const delta = now - lastDelta.current
      lastDelta.current = now
      setTimer((prev) => Math.max(Math.floor(prev - delta), 0))
    }, 20)
    intervalRef.current = interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [turn])

  const { hours, minutes, seconds, tenths } = formatTimer(timer)

  return (
    <div
      className={cn(
        'bg-primary text-primary-foreground w-fit rounded-xl px-4 py-2 text-4xl',
        turn != color && 'opacity-50',
        minutes == '00' && 'bg-destructive text-foreground'
      )}
    >
      {hours != '00'
        ? `${hours}:${minutes}:${seconds}`
        : minutes != '00'
          ? `${minutes}:${seconds}`
          : `${minutes}:${seconds}:${tenths}`}
    </div>
  )
}

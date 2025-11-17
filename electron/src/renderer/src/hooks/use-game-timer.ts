import { timerIncrementAtom, timersAtom, turnAtom } from '@/store'
import type { Color } from 'chess.js'
import { useAtomValue, useSetAtom } from 'jotai'
import React from 'react'

export const useGameTimer = () => {
  const setTimers = useSetAtom(timersAtom)
  const turn = useAtomValue(turnAtom)
  const increment = useAtomValue(timerIncrementAtom)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const lastDelta = React.useRef<number>(performance.now())
  const previousTurn = React.useRef<Color | null>(null)

  React.useEffect(() => {
    console.log({ previousTurn, turn })
    if (previousTurn.current != turn) {
      setTimers((prev) => ({
        ...prev,
        [previousTurn.current as Color]: prev[previousTurn.current as Color] + (increment ?? 0),
      }))
    }

    previousTurn.current = turn

    lastDelta.current = performance.now()
    const interval = setInterval(() => {
      const now = performance.now()
      const delta = now - lastDelta.current
      lastDelta.current = now
      setTimers((prev) => ({ ...prev, [turn]: prev[turn] - delta }))
    }, 20)
    intervalRef.current = interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [turn])
}

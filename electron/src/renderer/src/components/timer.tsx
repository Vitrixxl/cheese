import { cn } from '@/lib/utils'
import { timersAtom, turnAtom } from '@/store'
import type { Color } from 'chess.js'
import { useAtomValue } from 'jotai'

type TimerPros = {
  color: Color
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

export default function Timer({ color }: TimerPros) {
  const timer = useAtomValue(timersAtom)
  const turn = useAtomValue(turnAtom)

  const { hours, minutes, seconds, tenths } = formatTimer(timer[color])

  return (
    <div
      className={cn(
        'bg-primary text-primary-foreground w-fit rounded-xl px-4 py-2 text-4xl',
        turn != color && 'opacity-50',
        minutes == '00' && 'bg-destructive text-foreground',
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

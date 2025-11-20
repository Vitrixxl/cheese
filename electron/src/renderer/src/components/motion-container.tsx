import { cn } from '@/lib/utils'
import { motion as m } from 'motion/react'
export default function MotionContainer({
  children,
  from,
  delay,
  className,
}: React.PropsWithChildren<{
  delay: number
  from: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}>) {
  return (
    <m.div
      initial={{
        x: from == 'left' ? -50 : from == 'right' ? 50 : 0,
        y: from == 'top' ? -50 : from == 'bottom' ? 50 : 0,
        opacity: 0,
      }}
      animate={{
        x: 0,
        y: 0,
        opacity: 100,
      }}
      transition={{
        delay,
      }}
      className={cn('min-h-0 min-w-0', className)}
    >
      {children}
    </m.div>
  )
}

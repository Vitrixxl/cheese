import GameDrivenBoard from '@/components/drived-board/game-driven-board'
import LocalDrivenBoard from '@/components/drived-board/local-driven-board'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useQueue } from '@/hooks/use-queue'
import { currentDriverAtom } from '@/store'
import { useAtomValue } from 'jotai'

export default function AppPage() {
  const driver = useAtomValue(currentDriverAtom)

  return (
    <>
      {driver == 'local' ? <LocalDrivenBoard /> : driver == 'online' ? <GameDrivenBoard /> : null}
      {/* <LoadingGameDialog /> */}
    </>
  )
}

export function LoadingGameDialog() {
  const { isInQueue, leaveQueue } = useQueue()
  return (
    <Dialog open={isInQueue}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Veuillez patienter</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Button className="w-full" onClick={leaveQueue}>
          Leave queue
        </Button>
      </DialogContent>
    </Dialog>
  )
}

import LocalDrivenBoard from "@/components/drived-board/local-driven-board";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueue } from "@/hooks/use-queue";

export default function AppPage() {
  return (
    <>
      <LocalDrivenBoard />
      <LoadingGameDialog />
    </>
  );
}

export function LoadingGameDialog() {
  const { isInQueue, leaveQueue } = useQueue();
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
  );
}

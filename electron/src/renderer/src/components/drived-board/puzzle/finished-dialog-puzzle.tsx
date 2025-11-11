import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

type FinishedPuzzleDialogProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onNext: () => void;
};
export default function FinishedPuzzleDialog({
  open,
  onNext,
  onOpenChange,
}: FinishedPuzzleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Congrats you finished the puzzle</DialogTitle>
        </DialogHeader>
        <Button className="w-full" onClick={onNext}>
          Next puzzle
        </Button>
      </DialogContent>
    </Dialog>
  );
}

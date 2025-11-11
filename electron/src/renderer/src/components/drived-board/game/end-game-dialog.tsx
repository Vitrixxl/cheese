import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useUser } from "@/hooks/use-user";
import { capitalize } from "@/lib/utils";
import { endGameDialogOpenAtom, outcomeAtom } from "@/store";
import { useAtom, useAtomValue } from "jotai";
import React from "react";

export default function EndGameDialog() {
  const [isOpen, setIsOpen] = useAtom(endGameDialogOpenAtom);
  const outcome = useAtomValue(outcomeAtom);
  const { id } = useUser();
  React.useEffect(() => {
    if (outcome) {
      setIsOpen(true);
      return;
    }
    setIsOpen(false);
  }, [outcome]);
  if (!outcome) return;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="flex flex-col gap-2">
        <DialogHeader className="flex flex-col">
          <h2 className="text-2xl mx-auto font-semibold">
            {capitalize(outcome.outcome)}
          </h2>
          <p className="mx-auto">
            {outcome.winner
              ? outcome.winner == id
                ? "You won"
                : "You lose"
              : null}
          </p>
        </DialogHeader>
        <Button size="lg">Game analysis</Button>
        <div className="flex gap-2">
          <Button variant={"outline"} className="flex-1">
            Quit game
          </Button>
          <Button className="flex-1" variant="outline">
            New 10 minutes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

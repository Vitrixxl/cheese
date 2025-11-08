import { outcomeAtom } from "@/store";
import { Dialog, DialogContent, DialogOverlay } from "@radix-ui/react-dialog";
import { useAtomValue } from "jotai";
import React from "react";
import { Card } from "../ui/card";

export const GameOutcomeDialog = () => {
  const outcome = useAtomValue(outcomeAtom);
  const [open, setIsOpen] = React.useState(Boolean(outcome));

  React.useEffect(() => {
    if (!outcome) return;
    setIsOpen(true);
  }, [outcome]);

  return (
    <Dialog open={open}>
      <DialogOverlay
        className="absolute inset-0 bg-background/20 size-full "
        onClick={() => setIsOpen(false)}
      ></DialogOverlay>
      <DialogContent className="absolute top-1/2 left-1/2 -translate-1/2">
        <Card className="size-52">{outcome && outcome.outcome}</Card>
      </DialogContent>
    </Dialog>
  );
};

import { GAME_TYPES } from "@shared";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export type GameButtonProps = {
  gameType: keyof typeof GAME_TYPES;
  icon: React.ReactNode;
};
export const GameButton = ({ gameType, icon }: GameButtonProps) => {
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  const gameTypes = GAME_TYPES[gameType];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="aspect-square !size-auto flex flex-col group/button"
          variant={"outline"}
        >
          {icon}
          <span className="text-lg">{gameType}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose your game type</DialogTitle>
          <DialogDescription>
            Choose the type of game and press lezgoo to start a game
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <ToggleGroup
            type="single"
            onValueChange={setSelected}
            value={selected}
            className="w-full"
          >
            {gameTypes.map((g) => (
              <ToggleGroupItem value={g} variant={"outline"} className="flex-1">
                {g}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {selected && <Button>Let's goooo</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

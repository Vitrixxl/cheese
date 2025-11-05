import { GAME_TYPES, type GameType } from "@shared";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import React, { type ForwardRefExoticComponent } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { cn } from "@/lib/utils";
import type { LucideProps } from "lucide-react";

export type GameButtonProps = {
  gameType: keyof typeof GAME_TYPES;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  onSelect: (gameType: GameType) => void;
};
export const GameButton = ({
  gameType,
  onSelect,
  ...props
}: GameButtonProps) => {
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  const [isOpen, setIsOpen] = React.useState(false);
  const gameTypes = GAME_TYPES[gameType];
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "aspect-square !size-auto flex flex-col group/button",
            !isOpen && "not-hover:[&>.icon]:!text-foreground",
          )}
          variant={"outline"}
        >
          <props.icon
            style={{ color: `var(--${gameType}-color)` }}
            className="icon size-12"
          />
          <span className="text-lg">{gameType}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center group/button">
            <props.icon
              className="size-10"
              style={{ color: `var(--${gameType}-color)` }}
            />
            <span className="text-2xl">
              {gameType[0].toUpperCase()}
              {gameType.slice(1, gameType.length)}
            </span>
          </DialogTitle>
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
              <ToggleGroupItem
                value={g}
                variant={"outline"}
                className="flex-1 "
              >
                {g}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {selected && (
            <Button
              onClick={() => {
                setIsOpen(false);
                onSelect(selected as GameType);
              }}
            >
              Let's goooo
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

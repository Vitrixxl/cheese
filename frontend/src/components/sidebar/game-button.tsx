import { GAME_TYPES, type GameType } from "@shared";
import { Button } from "../ui/button";
import React, { type ForwardRefExoticComponent } from "react";
import type { LucideProps } from "lucide-react";
import { capitalize, cn } from "@/lib/utils";

export type GameButtonProps = {
  gameType: keyof typeof GAME_TYPES;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  selected: GameType | null;
  onSelect: (gameType: GameType) => void;
};
export const GameButton = ({
  gameType,
  onSelect,
  selected,
  ...props
}: GameButtonProps) => {
  const gameTypes = GAME_TYPES[gameType];
  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex gap-2 items-end">
        <props.icon
          className="size-8 fill-[]"
          style={{
            color: `var(--${gameType}-color)`,
          }}
        />
        <h2 className="text-xl font-semibold">{capitalize(gameType)}</h2>
      </div>
      <div className="flex gap-2 w-full">
        {gameTypes.map((g) => (
          <Button
            size="sm"
            key={g}
            className={cn(
              "flex-1 !bg-background hover:!bg-accent",
              selected == g && "text-foreground !bg-input/50",
            )}
            variant="outline"
            onClick={() => onSelect(g)}
          >
            {g}
          </Button>
        ))}
      </div>
    </div>
  );
};

import { GAME_TYPES, type GameType } from "@shared";
import { Button } from "../ui/button";
import React, { type ForwardRefExoticComponent } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [selected, setSelected] = React.useState<GameType | null>(null);
  const gameTypes = GAME_TYPES[gameType];
  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex gap-2 items-center">
        <props.icon
          className="size-10"
          style={{
            color: `var(--${gameType}-color)`,
          }}
        />
        <h2 className="text-xl font-semibold">{gameType}</h2>
      </div>
      <div className="flex gap-2 w-full">
        {gameTypes.map((g) => (
          <Button
            size="sm"
            className={cn(
              "flex-1 ",
              selected == g && "text-foreground !bg-input/50",
            )}
            variant="outline"
            onClick={() => (selected == g ? setSelected(null) : setSelected(g))}
            // style={{
            //   borderColor: `var(--${gameType}-color)`,
            // }}
          >
            {g}
          </Button>
        ))}
      </div>
      {selected && (
        <Button className="" onClick={() => onSelect(selected)}>
          Start
        </Button>
      )}
    </div>
  );
};

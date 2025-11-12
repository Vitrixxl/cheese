import { GAME_TIME_CONTROLS, type GameTimeControl } from "@shared";
import { Button } from "../ui/button";
import React, { type ForwardRefExoticComponent } from "react";
import { LucideChevronLeft, type LucideProps } from "lucide-react";
import { capitalize, cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { SidebarMenuButton, SidebarMenuSubButton } from "../ui/sidebar";

export type GameButtonProps = {
  category: keyof typeof GAME_TIME_CONTROLS;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  selected: GameTimeControl | null;
  onSelect: (timeControl: GameTimeControl) => void;
};
export const GameButton = ({
  category,
  onSelect,
  selected,
  ...props
}: GameButtonProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const timeControls = GAME_TIME_CONTROLS[category];
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <SidebarMenuButton className="flex justify-between" variant="outline">
          <div className="flex gap-2">
            <props.icon
              className="size-5"
              style={{
                color: `var(--${category}-color)`,
              }}
            />
            <h2 className="font-semibold">{capitalize(category)}</h2>
          </div>
          <LucideChevronLeft
            className={cn(
              "transition-transform size-4",
              isOpen && "-rotate-90",
            )}
          />
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex  gap-1 w-full mt-1">
          {timeControls.map((tc) => (
            <SidebarMenuSubButton
              size="sm"
              key={tc}
              className={cn(
                "!bg-background hover:!bg-accent justify-center font-semibold text-xs flex-1",
                selected == tc && "text-foreground !bg-input/50",
              )}
              onClick={() => onSelect(tc)}
              asChild
            >
              <button>{tc}</button>
            </SidebarMenuSubButton>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

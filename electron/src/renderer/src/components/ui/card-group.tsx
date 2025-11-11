import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

type CardGroupProps = {
  direction: "row" | "col";
  className?: string;
};

export function CardGroup({
  children,
  direction,
  className,
}: PropsWithChildren<CardGroupProps>) {
  return (
    <div
      className={cn(
        "flex border rounded-xl divide-border [&>[data-slot='card']]:!border-none bg-card",
        direction == "row" ? "divide-x" : "divide-y",
        className,
      )}
    >
      {children}
    </div>
  );
}

import { cn } from "@/lib/utils";
import React, { type ReactNode } from "react";
import { useState } from "react";
import { Button } from "./ui/button";
import { LucideX } from "lucide-react";
export type WindowProps = {
  initialWidth: number;
  initialHeight: number;
  title: string;
  onClose: () => void;
  icon: ReactNode;
};
export type Size = {
  height: number;
  width: number;
};

export type Position = {
  x: number;
  y: number;
};

export type UseResizeParams = {
  ref: HTMLDivElement | null;
  position: SquarePosition;
  onChange: ({
    position,
    offsetValues,
  }: {
    position: SquarePosition;
    offsetValues: Position;
  }) => void;
};
export const useResize = ({ ref, position, onChange }: UseResizeParams) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const lastDelta = React.useRef<{ x: number; y: number } | null>(null);
  const setLastDelta = (e: MouseEvent) => {
    lastDelta.current = {
      x: e.x,
      y: e.y,
    };
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!lastDelta.current) {
      setLastDelta(e);
      return;
    }
    onChange({
      position,
      offsetValues: {
        x: lastDelta.current.x - e.x,
        y: lastDelta.current.y - e.y,
      },
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleMouseDown = () => {
    setIsDragging(true);
  };
  React.useEffect(() => {
    if (!ref) return;

    if (isDragging) {
      ref.addEventListener("mouseup", handleMouseUp);
      ref.addEventListener("mousemove", handleMouseMove);
      ref.removeEventListener("mousedown", handleMouseDown);
    } else {
      ref.addEventListener("mousedown", handleMouseDown);
      ref.removeEventListener("mouseup", handleMouseUp);
      ref.removeEventListener("mousemove", handleMouseMove);
    }
  }, [ref]);
};

const SQUARE_POSITIONS = ["t", "b", "r", "l", "br", "bl", "tr", "tl"];
const SQUARE_CORNERS = ["br", "bl", "tr", "tl"];
const SQUARE_HORIZONTALS = ["t", "b"];
const SQUARE_VERTICALS = ["l", "r"];
export type SquarePosition = (typeof SQUARE_POSITIONS)[number];

export type ResizeBarProps = {
  squarePosition: SquarePosition;
};

export const ResizeBar = ({ squarePosition }: ResizeBarProps) => {
  return (
    <div
      className={cn(
        "absolute bg-pink-500",
        squarePosition == "b" && "top-full h-2 w-full left",
        squarePosition == "t" && "bottom-full h-2 w-full left",
        squarePosition == "r" && "left-full w-2 h-full",
        squarePosition == "l" && "right-full w-2 h-full",
        SQUARE_CORNERS.includes(squarePosition) && "size-4",
        squarePosition == "br" && "bottom-0 right-0",
        squarePosition == "bl" && "bottom-0 left-0",
        squarePosition == "tl" && "top-0 left-0",
        squarePosition == "tr" && "top-0 right-0",
      )}
    ></div>
  );
};

type WindowHeaderProps = {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
};

export function WindowHeader({ title, onClose, icon }: WindowHeaderProps) {
  return (
    <div className="flex justify-between mx-4 ml-2 py-2 ">
      <div className="flex gap-2">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <Button size="icon" onClick={onClose}>
        <LucideX />
      </Button>
    </div>
  );
}

export default function Window({
  initialWidth,
  initialHeight,
  title,
  icon,
  onClose,
  children,
}: React.PropsWithChildren<WindowProps>) {
  const [size, setSize] = useState<Size>({
    width: initialWidth,
    height: initialHeight,
  });

  return (
    <div
      className={cn("grid grid-rows border bg-background")}
      style={{
        height: size.height,
        width: size.width,
      }}
    >
      <WindowHeader title={title} onClose={onClose} icon={icon} />
      {children}
      {SQUARE_POSITIONS.map((p, i) => (
        <ResizeBar key={i} squarePosition={p} />
      ))}
    </div>
  );
}

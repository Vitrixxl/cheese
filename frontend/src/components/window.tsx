import { cn } from "@/lib/utils";
import React from "react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  LucideChevronsLeftRight,
  LucideChevronsRightLeft,
  LucideX,
} from "lucide-react";
import { windowsAtom, type WindowAtom } from "@/store/windows";
import { useAtom } from "jotai";
export type WindowProps = WindowAtom & {
  onFocus: () => void;
};
export type Size = {
  height: number;
  width: number;
};

export type Position = {
  x: number;
  y: number;
};

export const useWindows = () => {
  const [windows, setWindows] = useAtom(windowsAtom);
  const focusWindow = (id: string) => {
    setWindows((prev) => {
      console.log(prev);
      console.log(
        [
          ...prev.filter((w) => w.id != id),
          prev.find((w) => w.id == id),
        ].filter((w) => w != undefined),
      );
      return [
        ...prev.filter((w) => w.id != id),
        prev.find((w) => w.id == id),
      ].filter((w) => w != undefined);
    });
  };
  return {
    focusWindow,
    addWindow: (w: WindowAtom) => {
      if (windows.find((pw) => pw.id == w.id)) {
        return;
      }
      setWindows((prev) => [...prev, w]);
    },
    closeWindow: (id: string) =>
      setWindows((prev) => prev.filter((w) => w.id != id)),
    windows,
  };
};

export type UseResizeParams = {
  ref: React.RefObject<HTMLDivElement | null>;
  onChange: ({ offsetValues }: { offsetValues: Position }) => void;
};

export const useResize = ({ ref, onChange }: UseResizeParams) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const lastDelta = React.useRef<{ x: number; y: number } | null>(null);
  const setLastDelta = (e: MouseEvent) => {
    lastDelta.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!lastDelta.current) {
      setLastDelta(e);
      return;
    }
    onChange({
      offsetValues: {
        x: lastDelta.current.x - e.clientX,
        y: lastDelta.current.y - e.clientY,
      },
    });
    setLastDelta(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleMouseDown = (e: MouseEvent) => {
    setLastDelta(e);
    setIsDragging(true);
  };
  React.useEffect(() => {
    if (!ref.current) return;

    if (isDragging) {
      document.body.style.userSelect = "none";
      ref.current.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleMouseMove);
      ref.current.removeEventListener("mousedown", handleMouseDown);
    } else {
      document.body.style.userSelect = "";
      ref.current.addEventListener("mousedown", handleMouseDown);
      ref.current.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    }
  }, [ref, isDragging]);
};

const SQUARE_POSITIONS = ["t", "b", "r", "l", "br", "bl", "tr", "tl"] as const;
const SQUARE_CORNERS = ["br", "bl", "tr", "tl"] as const;
const SQUARE_HORIZONTALS = ["t", "b"] as const;
const SQUARE_VERTICALS = ["l", "r"] as const;
export type SquarePosition = (typeof SQUARE_POSITIONS)[number];

export type ResizeBarProps = {
  squarePosition: SquarePosition;
  enable: boolean;
  onResize: ({
    squarePosition,
    offset,
  }: {
    offset: Position;
    squarePosition: SquarePosition;
  }) => void;
};

export const ResizeBar = ({
  squarePosition,
  onResize,
  enable,
}: ResizeBarProps) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  useResize({
    ref,
    onChange: ({ offsetValues }) =>
      onResize({ squarePosition, offset: offsetValues }),
  });
  return (
    <div
      ref={ref}
      className={cn(
        "absolute ",
        !enable && "!cursor-default",
        squarePosition == "b" &&
          "top-full h-2 w-full left -translate-y-1/2  cursor-ns-resize",
        squarePosition == "t" &&
          "bottom-full h-2 w-full left translate-y-1/2 cursor-ns-resize",
        squarePosition == "r" &&
          "left-full w-2 h-full -translate-x-1/2 cursor-ew-resize",
        squarePosition == "l" &&
          "right-full w-2 h-full translate-x-1/2 cursor-ew-resize",
        SQUARE_CORNERS.includes(squarePosition) && "size-2 cursor-nwse-resize",
        squarePosition == "br" && "bottom-0 right-0 translate-1/2",
        squarePosition == "bl" &&
          "bottom-0 left-0 translate-y-1/2 -translate-x-1/2",
        squarePosition == "tl" && "top-0 left-0 -translate-1/2",
        squarePosition == "tr" &&
          "top-0 right-0 -translate-y-1/2 translate-x-1/2",
      )}
    ></div>
  );
};

type WindowHeaderProps = {
  title: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  onMove: (offsetValues: Position) => void;
  onFullScreen: () => void;
  isFullScreen: boolean;
  canResize: boolean;
};

export function WindowHeader({
  title,
  onClose,
  icon,
  onMove,
  onFullScreen,
  isFullScreen,
  canResize,
}: WindowHeaderProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  useResize({
    ref,
    onChange: ({ offsetValues }) => onMove(offsetValues),
  });
  return (
    <div
      className="flex justify-between px-4 pr-2 py-2  items-center h-fit border-b select-none"
      ref={ref}
    >
      <div className="flex gap-2 ">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="flex gap-2">
        {canResize && (
          <Button size="icon" variant={"outline"} onClick={onFullScreen}>
            {isFullScreen ? (
              <LucideChevronsRightLeft className="-rotate-45" />
            ) : (
              <LucideChevronsLeftRight className="-rotate-45" />
            )}
          </Button>
        )}
        <Button
          size="icon"
          onClick={() => onClose && onClose()}
          variant={"destructive"}
        >
          <LucideX />
        </Button>
      </div>
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
  onFocus,
  noResize,
  fitSize,
}: WindowProps) {
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [position, setPosition] = useState<Position>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const [size, setSize] = useState<Size>({
    width: initialWidth,
    height: initialHeight,
  });

  const handleMove = ({ x: newX, y: newY }: Position) => {
    setPosition(({ x, y }) => ({ x: x - newX, y: y - newY }));
  };

  const handleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
    if (!isFullScreen) {
      setSize({
        height: window.innerHeight - 32,
        width: window.innerWidth - 32,
      });
      setPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    } else {
      setSize({
        width: initialWidth,
        height: initialHeight,
      });
      setPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    }
  };

  const handleResize = ({
    offset,
    squarePosition,
  }: {
    offset: Position;
    squarePosition: SquarePosition;
  }) => {
    if (isFullScreen) return;
    if (squarePosition == "b") {
      setSize((prev) => ({
        width: prev.width,
        height: prev.height - offset.y * 2,
      }));
      return;
    }
    if (squarePosition == "t") {
      setSize((prev) => ({
        width: prev.width,
        height: prev.height + offset.y * 2,
      }));
    }
    if (squarePosition == "l") {
      setSize((prev) => ({
        width: prev.width + offset.x * 2,
        height: prev.height,
      }));
    }
    if (squarePosition == "r") {
      setSize((prev) => ({
        width: prev.width - offset.x * 2,
        height: prev.height,
      }));
      return;
    }
    if (squarePosition.startsWith("b")) {
      setSize((prev) => ({
        width: prev.width - offset.x * 2,
        height: prev.height - offset.y * 2,
      }));
    }
    // if (SQUARE_HORIZONTALS.includes(squarePosition)) {
    //   return;
    // }
    //
    // if (SQUARE_VERTICALS.includes(squarePosition)) {
    //   return;
    // }

    // if (SQUARE_HORIZONTALS)
  };

  return (
    <div
      className={cn(
        "grid grid-rows-[auto_minmax(0,1fr)] border bg-card -translate-1/2 fixed rounded-xl z-20  ",
      )}
      style={{
        height: fitSize ? "auto" : size.height,
        width: fitSize ? "auto" : size.height,
        left: position.x,
        top: position.y,
      }}
      onMouseDown={onFocus}
    >
      <WindowHeader
        title={title}
        onClose={onClose}
        icon={icon}
        onMove={handleMove}
        onFullScreen={handleFullScreen}
        isFullScreen={isFullScreen}
        canResize={!fitSize}
      />
      <div className="p-4">{children}</div>
      {SQUARE_POSITIONS.map((p, i) => (
        <ResizeBar
          key={i}
          squarePosition={p}
          onResize={handleResize}
          enable={!noResize}
        />
      ))}
    </div>
  );
}

export function WindowsProvider({ children }: React.PropsWithChildren) {
  const { windows, focusWindow, closeWindow } = useWindows();
  return (
    <>
      {children}
      {windows.map((w) => (
        <Window
          key={w.id}
          {...w}
          onClose={() => {
            closeWindow(w.id);
            w.onClose && w.onClose();
          }}
          onFocus={() => {
            focusWindow(w.id);
          }}
        />
      ))}
    </>
  );
}

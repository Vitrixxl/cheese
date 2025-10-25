import { atom } from "jotai";
import type { ReactNode } from "react";
export type WindowAtom = {
  id: string;
  initialWidth: number;
  initialHeight: number;
  title: string;
  onClose?: () => void;
  icon?: ReactNode;
  children: ReactNode;
  noResize?: boolean;
  fitSize?: boolean;
};
export const windowsAtom = atom<WindowAtom[]>([]);

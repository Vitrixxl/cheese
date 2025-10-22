import { atom } from "jotai";
import type { ReactNode } from "react";
type WindowsAtom = {
  id: string;
  title: string;
  icon: ReactNode;
  initialWidth: number;
  initialHeight: number;
  children: ReactNode;
  onClose: () => void;
  close: () => void;
}[];
export const windowsAtom = atom<WindowsAtom>([]);

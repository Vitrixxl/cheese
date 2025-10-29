import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const exclude = <T extends Record<string, any>>(
  o: T,
  toExclude: (keyof T)[],
): Omit<T, (typeof toExclude)[number]> => {
  return Object.fromEntries(
    Object.entries(o).filter(([key]) => !toExclude.includes(key as keyof T)),
  ) as Omit<T, (typeof toExclude)[number]>;
};

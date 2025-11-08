import z from "zod";

export const exclude = <T extends Record<string, any>>(
  o: T,
  toExclude: (keyof T)[],
): Omit<T, (typeof toExclude)[number]> => {
  return Object.fromEntries(
    Object.entries(o).filter(([key]) => !toExclude.includes(key as keyof T)),
  ) as Omit<T, (typeof toExclude)[number]>;
};
export const getPaginatedQuery = (limitDefault = 50, offsetDefault = 0) =>
  z.object({
    limit: z.coerce.number().default(limitDefault),
    cursor: z.coerce.number().default(offsetDefault),
  });

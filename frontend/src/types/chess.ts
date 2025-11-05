export type DriverType = "online" | "puzzle" | "local";
export type LocalMove = {
  from: string;
  to: string;
  promotion?: string;
};

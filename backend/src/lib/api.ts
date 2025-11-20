import { treaty } from "@elysiajs/eden";
import type { GameApi } from "@shared";
export const gameServerApi = treaty<GameApi>("localhost:3001");

import { treaty } from "@elysiajs/eden";
import { GameApi } from "@shared";
export const gameServerApi = treaty<GameApi>("localhost:3001");

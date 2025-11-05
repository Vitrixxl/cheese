import { treaty } from "@elysiajs/eden";
import type { App } from "@shared";
export const api = treaty<App>("localhost:6969");

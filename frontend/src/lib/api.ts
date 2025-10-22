import { treaty } from "@elysiajs/eden";
import type { App } from "@chessinator/backend";

const client = treaty<App>("localhost:3000");
const { data } = await client.data.post({});

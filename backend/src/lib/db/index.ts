import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { join } from "path";

const dbPath = join(import.meta.dir, "../../../db.sqlite");
const sqlite = new Database(dbPath);

export const db = drizzle({ client: sqlite });

import { SQL } from "bun";

if (!process.env.DATABASE_URL) {
  throw new Error("Database credentials missing.");
}

export const db = new SQL(process.env.DATABASE_URL);

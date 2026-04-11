import { readFile, writeFile, rename } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AppDatabase } from "./types";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DB_FILE = join(__dirname, "db.json");
const TMP_FILE = join(__dirname, "db.json.tmp");

export async function readDb(): Promise<AppDatabase> {
  const raw = await readFile(DB_FILE, "utf8");
  return JSON.parse(raw) as AppDatabase;
}

export async function writeDb(data: AppDatabase): Promise<void> {
  const payload = `${JSON.stringify(data, null, 2)}\n`;
  await writeFile(TMP_FILE, payload, "utf8");
  await rename(TMP_FILE, DB_FILE);
}

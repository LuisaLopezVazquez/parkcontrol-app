import type { Request, Response, NextFunction } from "express";
import type { DbUser } from "./types";
import { readDb, writeDb } from "./store";
import { randomUUID } from "node:crypto";

export type PublicUser = Omit<DbUser, "password">;

export type AuthedRequest = Request & { authUser: PublicUser };

export function getBearerToken(req: Request): string | null {
  const raw = req.headers.authorization;
  if (!raw || !raw.startsWith("Bearer ")) return null;
  const t = raw.slice(7).trim();
  return t || null;
}

export function toPublicUser(u: DbUser) {
  const { password: _p, ...rest } = u;
  return rest;
}

export async function resolveUserIdForToken(token: string | null): Promise<string | null> {
  if (!token) return null;
  const db = await readDb();
  const sessions = db.sessions ?? [];
  const hit = sessions.find((s) => s.token === token);
  return hit?.userId ?? null;
}

export async function createSession(userId: string): Promise<string> {
  const db = await readDb();
  if (!db.sessions) db.sessions = [];
  const token = randomUUID();
  db.sessions.push({
    token,
    userId,
    createdAt: new Date().toISOString(),
  });
  await writeDb(db);
  return token;
}

export async function revokeSession(token: string | null): Promise<void> {
  if (!token) return;
  const db = await readDb();
  if (!db.sessions?.length) return;
  db.sessions = db.sessions.filter((s) => s.token !== token);
  await writeDb(db);
}

/** Rutas que requieren sesión válida en `db.json`. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req);
    const userId = await resolveUserIdForToken(token);
    if (!userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const db = await readDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      res.status(401).json({ error: "Sesión inválida" });
      return;
    }
    (req as AuthedRequest).authUser = toPublicUser(user);
    next();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
}

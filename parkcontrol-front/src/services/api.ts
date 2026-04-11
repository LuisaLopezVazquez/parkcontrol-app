/**
 * Cliente REST hacia Express (`server/` + `server/db.json`).
 * Patrón de auth: login devuelve `accessToken`; rutas protegidas envían `Authorization: Bearer`.
 */
import type { User, ParkingSpot, Vehicle, DashboardMetrics } from "./mockData";

export const STORAGE_ACCESS_TOKEN_KEY = "parkcontrol_access_token";

const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

function apiUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${apiBase}${path}`;
}

function readStoredAccessToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(STORAGE_ACCESS_TOKEN_KEY);
}

/** fetch con Bearer si hay token guardado (rutas protegidas). */
function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  const token = readStoredAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(apiUrl(path), { ...init, headers, credentials: "same-origin" });
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let message = res.statusText;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (j?.error) message = j.error;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }
  return (text ? JSON.parse(text) : null) as T;
}

export type LoginResponse = {
  user: User;
  accessToken: string;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ email, password }),
  });
  return parseJson<LoginResponse>(res);
}

export async function logout(): Promise<void> {
  const res = await apiFetch("/api/auth/logout", { method: "POST" });
  if (res.status === 204 || res.ok) return;
  await parseJson<never>(res);
}

export async function getCurrentUser(): Promise<User> {
  const res = await apiFetch("/api/auth/me");
  return parseJson<User>(res);
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await apiFetch("/api/dashboard/metrics");
  return parseJson<DashboardMetrics>(res);
}

export async function getParkingSpots(): Promise<ParkingSpot[]> {
  const res = await apiFetch("/api/parking-spots");
  return parseJson<ParkingSpot[]>(res);
}

export async function getRecentVehicles(): Promise<Vehicle[]> {
  const res = await apiFetch("/api/vehicles/recent");
  return parseJson<Vehicle[]>(res);
}

export type UpdateSpotBody =
  | { status: "available" }
  | { status: "occupied"; vehiclePlate?: string; ownerName?: string };

export async function updateParkingSpot(id: string, body: UpdateSpotBody): Promise<ParkingSpot> {
  const res = await apiFetch(`/api/parking-spots/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<ParkingSpot>(res);
}

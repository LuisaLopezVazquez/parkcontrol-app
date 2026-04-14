/**
 * Cliente REST → Express (`server/` + `server/db.json`).
 * Auth: Bearer tras login; en dev Vite proxifica `/api` → puerto 3001.
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

export type LoginResponse = { user: User; accessToken: string };

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

/** Lista completa (administración), orden descendente por fecha de registro. */
export async function listVehicles(): Promise<Vehicle[]> {
  const res = await apiFetch("/api/vehicles");
  return parseJson<Vehicle[]>(res);
}

export async function getVehicle(id: string): Promise<Vehicle> {
  const res = await apiFetch(`/api/vehicles/${encodeURIComponent(id)}`);
  return parseJson<Vehicle>(res);
}

export type CreateVehiclePayload = Omit<Vehicle, "id"> & { id?: string };

export async function createVehicle(payload: CreateVehiclePayload): Promise<Vehicle> {
  const { id: _omit, ...rest } = payload;
  const res = await apiFetch("/api/vehicles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rest),
  });
  return parseJson<Vehicle>(res);
}

export type UpdateVehiclePayload = Partial<Omit<Vehicle, "id">>;

export async function updateVehicle(id: string, payload: UpdateVehiclePayload): Promise<Vehicle> {
  const res = await apiFetch(`/api/vehicles/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson<Vehicle>(res);
}

export async function deleteVehicle(id: string): Promise<void> {
  const res = await apiFetch(`/api/vehicles/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (res.status === 204) return;
  if (!res.ok) await parseJson<never>(res);
}

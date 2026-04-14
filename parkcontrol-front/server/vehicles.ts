import type { DbVehicle } from "./types";

export function nextVehicleId(vehicles: DbVehicle[]): string {
  const nums = vehicles.map((v) => parseInt(v.id, 10)).filter((n) => Number.isFinite(n) && n > 0);
  if (nums.length === 0) return "1";
  return String(Math.max(...nums) + 1);
}

export function normalizePlate(plate: string): string {
  return plate.trim().toUpperCase();
}

export function isPlateTaken(vehicles: DbVehicle[], plate: string, exceptId?: string): boolean {
  const n = normalizePlate(plate);
  return vehicles.some((v) => v.id !== exceptId && normalizePlate(v.plate) === n);
}

/**
 * API service layer — mock implementation.
 * Replace with real API calls when backend is ready.
 */
import {
  mockUser,
  mockParkingSpots,
  mockVehicles,
  mockMetrics,
  type User,
  type ParkingSpot,
  type Vehicle,
  type DashboardMetrics,
} from "./mockData";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function login(email: string, _password: string): Promise<User> {
  await delay(500);
  if (email && _password) return mockUser;
  throw new Error("Credenciales inválidas");
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  await delay();
  return mockMetrics;
}

export async function getParkingSpots(): Promise<ParkingSpot[]> {
  await delay();
  return mockParkingSpots;
}

export async function getRecentVehicles(): Promise<Vehicle[]> {
  await delay();
  return mockVehicles;
}

export async function getCurrentUser(): Promise<User> {
  await delay();
  return mockUser;
}

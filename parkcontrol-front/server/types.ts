export interface DbUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  condominium: string;
}

export interface DbParkingSpot {
  id: string;
  number: string;
  status: "available" | "occupied";
  vehiclePlate?: string;
  ownerName?: string;
  floor: string;
}

export interface DbVehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  ownerName: string;
  unit: string;
  registeredAt: string;
  spotNumber?: string;
}

export interface DbSession {
  token: string;
  userId: string;
  createdAt: string;
}

export interface AppDatabase {
  users: DbUser[];
  parkingSpots: DbParkingSpot[];
  vehicles: DbVehicle[];
  /** Sesiones simuladas (token Bearer) persistidas en JSON. */
  sessions?: DbSession[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  condominium: string;
}

export interface ParkingSpot {
  id: string;
  number: string;
  status: "available" | "occupied";
  vehiclePlate?: string;
  ownerName?: string;
  floor: string;
}

export interface Vehicle {
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

export interface DashboardMetrics {
  totalSpots: number;
  availableSpots: number;
  occupiedSpots: number;
  registeredVehicles: number;
}

export const mockUser: User = {
  id: "1",
  name: "Luisa Lopez",
  email: "luisa@residencial-altavista.com",
  role: "Administrador",
  condominium: "Residencial Altavista",
};

export const mockParkingSpots: ParkingSpot[] = [
  { id: "1", number: "A-01", status: "occupied", vehiclePlate: "ABC-1234", ownerName: "Juan Pérez", floor: "Nivel 1" },
  { id: "2", number: "A-02", status: "available", floor: "Nivel 1" },
  { id: "3", number: "A-03", status: "occupied", vehiclePlate: "DEF-5678", ownerName: "María García", floor: "Nivel 1" },
  { id: "4", number: "A-04", status: "available", floor: "Nivel 1" },
  { id: "5", number: "A-05", status: "occupied", vehiclePlate: "GHI-9012", ownerName: "Roberto López", floor: "Nivel 1" },
  { id: "6", number: "A-06", status: "available", floor: "Nivel 1" },
  { id: "7", number: "B-01", status: "occupied", vehiclePlate: "JKL-3456", ownerName: "Ana Torres", floor: "Nivel 1" },
  { id: "8", number: "B-02", status: "occupied", vehiclePlate: "MNO-7890", ownerName: "Luis Ramírez", floor: "Nivel 1" },
  { id: "9", number: "B-03", status: "available", floor: "Nivel 1" },
  { id: "10", number: "B-04", status: "occupied", vehiclePlate: "PQR-1122", ownerName: "Sofía Hernández", floor: "Nivel 1" },
  { id: "11", number: "B-05", status: "available", floor: "Nivel 2" },
  { id: "12", number: "B-06", status: "available", floor: "Nivel 2" },
  { id: "13", number: "C-01", status: "occupied", vehiclePlate: "STU-3344", ownerName: "Diego Morales", floor: "Nivel 2" },
  { id: "14", number: "C-02", status: "available", floor: "Nivel 2" },
  { id: "15", number: "C-03", status: "occupied", vehiclePlate: "VWX-5566", ownerName: "Elena Castro", floor: "Nivel 2" },
  { id: "16", number: "C-04", status: "available", floor: "Nivel 2" },
  { id: "17", number: "C-05", status: "occupied", vehiclePlate: "YZA-7788", ownerName: "Fernando Ruiz", floor: "Nivel 2" },
  { id: "18", number: "C-06", status: "occupied", vehiclePlate: "BCD-9900", ownerName: "Patricia Flores", floor: "Nivel 2" },
  { id: "19", number: "D-01", status: "available", floor: "Nivel 2" },
  { id: "20", number: "D-02", status: "occupied", vehiclePlate: "EFG-1133", ownerName: "Ricardo Vargas", floor: "Nivel 2" },
];

export const mockVehicles: Vehicle[] = [
  { id: "1", plate: "ABC-1234", brand: "Toyota", model: "Corolla 2023", color: "Blanco", ownerName: "Juan Pérez", unit: "101-A", registeredAt: "2025-04-10", spotNumber: "A-01" },
  { id: "2", plate: "DEF-5678", brand: "Honda", model: "Civic 2022", color: "Negro", ownerName: "María García", unit: "205-B", registeredAt: "2025-04-09", spotNumber: "A-03" },
  { id: "3", plate: "GHI-9012", brand: "Nissan", model: "Sentra 2024", color: "Gris", ownerName: "Roberto López", unit: "302-A", registeredAt: "2025-04-08", spotNumber: "A-05" },
  { id: "4", plate: "JKL-3456", brand: "Volkswagen", model: "Jetta 2023", color: "Azul", ownerName: "Ana Torres", unit: "108-C", registeredAt: "2025-04-07", spotNumber: "B-01" },
  { id: "5", plate: "MNO-7890", brand: "Mazda", model: "3 2024", color: "Rojo", ownerName: "Luis Ramírez", unit: "410-A", registeredAt: "2025-04-06", spotNumber: "B-02" },
  { id: "6", plate: "PQR-1122", brand: "Chevrolet", model: "Aveo 2022", color: "Plata", ownerName: "Sofía Hernández", unit: "215-B", registeredAt: "2025-04-05", spotNumber: "B-04" },
];

export const mockMetrics: DashboardMetrics = {
  totalSpots: 20,
  availableSpots: mockParkingSpots.filter(s => s.status === "available").length,
  occupiedSpots: mockParkingSpots.filter(s => s.status === "occupied").length,
  registeredVehicles: mockVehicles.length,
};

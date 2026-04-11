import type { ParkingSpot } from "@/services/mockData";
import { Car } from "lucide-react";

interface ParkingSpotCardProps {
  spot: ParkingSpot;
}

function ParkingSpotCard({ spot }: ParkingSpotCardProps) {
  const isOccupied = spot.status === "occupied";

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-all duration-200 hover:scale-105 ${
        isOccupied
          ? "border-destructive/40 bg-destructive/8"
          : "border-available/40 bg-available/8"
      }`}
    >
      <span
        className={`text-xs font-bold tracking-wide ${
          isOccupied ? "text-destructive" : "text-available"
        }`}
      >
        {spot.number}
      </span>
      <Car
        className={`mt-1 h-5 w-5 ${
          isOccupied ? "text-destructive/70" : "text-available/40"
        }`}
      />
      {isOccupied && spot.vehiclePlate && (
        <span className="mt-1 text-[10px] text-muted-foreground truncate max-w-full">
          {spot.vehiclePlate}
        </span>
      )}
    </div>
  );
}

interface ParkingGridProps {
  spots: ParkingSpot[];
}

export function ParkingGrid({ spots }: ParkingGridProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground font-[family-name:var(--font-heading)]">
          Mapa de Cajones
        </h3>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-available" /> Disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive" /> Ocupado
          </span>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {spots.map((spot) => (
          <ParkingSpotCard key={spot.id} spot={spot} />
        ))}
      </div>
    </div>
  );
}

import type { ParkingSpot } from "@/services/mockData";
import { Car } from "lucide-react";

interface ParkingSpotCardProps {
  spot: ParkingSpot;
  interactive?: boolean;
  busy?: boolean;
  onToggle?: (spot: ParkingSpot) => void;
}

function ParkingSpotCard({ spot, interactive, busy, onToggle }: ParkingSpotCardProps) {
  const isOccupied = spot.status === "occupied";

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-busy={busy || undefined}
      aria-label={interactive ? `Cajón ${spot.number}, ${isOccupied ? "ocupado" : "disponible"}. Clic para alternar.` : undefined}
      onClick={interactive && onToggle && !busy ? () => onToggle(spot) : undefined}
      onKeyDown={
        interactive && onToggle && !busy
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(spot);
              }
            }
          : undefined
      }
      className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-all duration-200 ${
        interactive ? "cursor-pointer hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" : "hover:scale-105"
      } ${busy ? "opacity-60 pointer-events-none" : ""} ${
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
  onToggleSpot?: (spot: ParkingSpot) => void;
  togglingSpotId?: string | null;
}

export function ParkingGrid({ spots, onToggleSpot, togglingSpotId }: ParkingGridProps) {
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
          <ParkingSpotCard
            key={spot.id}
            spot={spot}
            interactive={!!onToggleSpot}
            busy={togglingSpotId === spot.id}
            onToggle={onToggleSpot}
          />
        ))}
      </div>
    </div>
  );
}

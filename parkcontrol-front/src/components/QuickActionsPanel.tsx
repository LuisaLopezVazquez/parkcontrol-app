import { Link } from "@tanstack/react-router";
import { Car, ParkingSquare, Plus } from "lucide-react";

export function QuickActionsPanel() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-card-foreground font-[family-name:var(--font-heading)]">
        Acciones Rápidas
      </h3>
      <div className="flex flex-col gap-3">
        <Link
          to="/vehicles"
          className="flex items-center gap-3 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-accent-foreground transition-all hover:opacity-90 hover:shadow-md"
        >
          <Car className="h-4 w-4" />
          Registrar Vehículo
        </Link>
        <button
          type="button"
          title="Próximamente"
          className="flex cursor-not-allowed items-center gap-3 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground opacity-60"
        >
          <ParkingSquare className="h-4 w-4" />
          Ver Cajones
        </button>
        <button
          type="button"
          title="Próximamente"
          className="flex cursor-not-allowed items-center gap-3 rounded-lg bg-available px-4 py-3 text-sm font-medium text-available-foreground opacity-60"
        >
          <Plus className="h-4 w-4" />
          Agregar Cajón
        </button>
      </div>
    </div>
  );
}

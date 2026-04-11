import { Car, ParkingSquare, Plus } from "lucide-react";

const actions = [
  { label: "Registrar Vehículo", icon: Car, color: "bg-accent text-accent-foreground" },
  { label: "Ver Cajones", icon: ParkingSquare, color: "bg-primary text-primary-foreground" },
  { label: "Agregar Cajón", icon: Plus, color: "bg-available text-available-foreground" },
];

export function QuickActionsPanel() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-card-foreground font-[family-name:var(--font-heading)]">
        Acciones Rápidas
      </h3>
      <div className="flex flex-col gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:opacity-90 hover:shadow-md ${a.color}`}
          >
            <a.icon className="h-4 w-4" />
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

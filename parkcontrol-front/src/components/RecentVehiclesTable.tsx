import type { Vehicle } from "@/services/mockData";

interface RecentVehiclesTableProps {
  vehicles: Vehicle[];
}

export function RecentVehiclesTable({ vehicles }: RecentVehiclesTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h3 className="text-lg font-semibold text-card-foreground font-[family-name:var(--font-heading)]">
          Vehículos Recientes
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-5 py-3 font-medium text-muted-foreground">Placa</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Vehículo</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Propietario</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Unidad</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Cajón</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Registro</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 font-semibold text-accent">{v.plate}</td>
                <td className="px-5 py-3">
                  {v.brand} {v.model}
                  <span className="ml-2 text-xs text-muted-foreground">({v.color})</span>
                </td>
                <td className="px-5 py-3">{v.ownerName}</td>
                <td className="px-5 py-3">{v.unit}</td>
                <td className="px-5 py-3">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {v.spotNumber}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{v.registeredAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import type { DashboardMetrics } from "@/services/mockData";
import { Car, ParkingSquare, CircleCheck, CircleX } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "available" | "occupied" | "accent";
}

function SummaryCard({ title, value, icon, variant = "default" }: SummaryCardProps) {
  const variantStyles = {
    default: "border-border",
    available: "border-available/30",
    occupied: "border-destructive/30",
    accent: "border-accent/30",
  };

  const iconBg = {
    default: "bg-primary/10 text-primary",
    available: "bg-available/10 text-available",
    occupied: "bg-destructive/10 text-destructive",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className={`rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-card-foreground font-[family-name:var(--font-heading)]">
            {value}
          </p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface SummaryCardsProps {
  metrics: DashboardMetrics;
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Total de Cajones"
        value={metrics.totalSpots}
        icon={<ParkingSquare className="h-6 w-6" />}
      />
      <SummaryCard
        title="Disponibles"
        value={metrics.availableSpots}
        icon={<CircleCheck className="h-6 w-6" />}
        variant="available"
      />
      <SummaryCard
        title="Ocupados"
        value={metrics.occupiedSpots}
        icon={<CircleX className="h-6 w-6" />}
        variant="occupied"
      />
      <SummaryCard
        title="Vehículos Registrados"
        value={metrics.registeredVehicles}
        icon={<Car className="h-6 w-6" />}
        variant="accent"
      />
    </div>
  );
}

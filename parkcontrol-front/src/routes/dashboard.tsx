import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { TopNavBar } from "@/components/TopNavBar";
import { SummaryCards } from "@/components/SummaryCards";
import { ParkingGrid } from "@/components/ParkingGrid";
import { RecentVehiclesTable } from "@/components/RecentVehiclesTable";
import { QuickActionsPanel } from "@/components/QuickActionsPanel";
import { mockMetrics, mockParkingSpots, mockVehicles, mockUser } from "@/services/mockData";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ParkControl" },
      { name: "description", content: "Panel de control del estacionamiento" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { isAuthenticated, logout, user, ready } = useAuth();

  if (!ready) return null;

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  const currentUser = user || mockUser;

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar user={currentUser} onLogout={logout} />

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground font-[family-name:var(--font-heading)]">
            Bienvenido, {currentUser.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aquí tienes el resumen de tu estacionamiento hoy
          </p>
        </div>

        {/* KPIs */}
        <SummaryCards metrics={mockMetrics} />

        {/* Grid + Actions */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
          <ParkingGrid spots={mockParkingSpots} />
          <QuickActionsPanel />
        </div>

        {/* Recent vehicles */}
        <div className="mt-6">
          <RecentVehiclesTable vehicles={mockVehicles} />
        </div>
      </main>
    </div>
  );
}

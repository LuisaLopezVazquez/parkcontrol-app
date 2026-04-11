import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { TopNavBar } from "@/components/TopNavBar";
import { SummaryCards } from "@/components/SummaryCards";
import { ParkingGrid } from "@/components/ParkingGrid";
import { RecentVehiclesTable } from "@/components/RecentVehiclesTable";
import { QuickActionsPanel } from "@/components/QuickActionsPanel";
import type { DashboardMetrics, ParkingSpot, Vehicle } from "@/services/mockData";
import * as api from "@/services/api";

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
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [togglingSpotId, setTogglingSpotId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !isAuthenticated) return;

    let cancelled = false;
    (async () => {
      setDashboardLoading(true);
      setLoadError(null);
      try {
        const [m, s, v] = await Promise.all([
          api.getDashboardMetrics(),
          api.getParkingSpots(),
          api.getRecentVehicles(),
        ]);
        if (!cancelled) {
          setMetrics(m);
          setSpots(s);
          setVehicles(v);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setDashboardLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, isAuthenticated]);

  const handleToggleSpot = useCallback(async (spot: ParkingSpot) => {
    if (togglingSpotId) return;
    setTogglingSpotId(spot.id);
    setLoadError(null);
    try {
      const body =
        spot.status === "occupied"
          ? ({ status: "available" } as const)
          : ({
              status: "occupied",
              vehiclePlate: "VIS-0001",
              ownerName: "Visitante",
            } as const);
      const updated = await api.updateParkingSpot(spot.id, body);
      setSpots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setMetrics(await api.getDashboardMetrics());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      setTogglingSpotId(null);
    }
  }, [togglingSpotId]);

  if (!ready) return null;

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar user={user} onLogout={logout} />

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground font-[family-name:var(--font-heading)]">
            Bienvenido, {user.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aquí tienes el resumen de tu estacionamiento hoy
          </p>
        </div>

        {loadError && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {loadError}
            <span className="mt-1 block text-xs text-muted-foreground">
              Asegúrate de ejecutar <code className="rounded bg-muted px-1">npm run dev</code> (API + Vite). El API escucha en el puerto 3001.
            </span>
          </div>
        )}

        {dashboardLoading ? (
          <p className="text-sm text-muted-foreground">Cargando datos…</p>
        ) : metrics ? (
          <>
            <SummaryCards metrics={metrics} />

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  Clic en un cajón para alternar disponible / ocupado (se guarda en{" "}
                  <code className="rounded bg-muted px-1">server/db.json</code>).
                </p>
                <ParkingGrid
                  spots={spots}
                  onToggleSpot={handleToggleSpot}
                  togglingSpotId={togglingSpotId}
                />
              </div>
              <QuickActionsPanel />
            </div>

            <div className="mt-6">
              <RecentVehiclesTable vehicles={vehicles} />
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

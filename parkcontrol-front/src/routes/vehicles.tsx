import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TopNavBar } from "@/components/TopNavBar";
import { VehicleFormDialog } from "@/components/VehicleFormDialog";
import type { Vehicle } from "@/services/mockData";
import * as api from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/vehicles")({
  head: () => ({
    meta: [
      { title: "Vehículos — ParkControl" },
      { name: "description", content: "Administración de vehículos del condominio" },
    ],
  }),
  component: VehiclesAdminPage,
});

const PAGE_SIZE_OPTIONS = [5, 10, 25] as const;

function VehiclesAdminPage() {
  const { isAuthenticated, logout, user, ready } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);
  /** Móvil: fila tocada → detalle (el resto de campos + acciones). */
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setVehicles(await api.listVehicles());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready || !isAuthenticated) return;
    void load();
  }, [ready, isAuthenticated, load]);

  const total = vehicles.length;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages, total]);

  const paginatedVehicles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return vehicles.slice(start, start + pageSize);
  }, [vehicles, page, pageSize]);

  const rangeFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeTo = Math.min(page * pageSize, total);

  const openCreate = () => {
    setFormMode("create");
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setDetailVehicle(null);
    setFormMode("edit");
    setEditing(v);
    setFormOpen(true);
  };

  const isMobileViewport = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteVehicle(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeleting(false);
    }
  };

  if (!ready) return null;
  if (!isAuthenticated) return <Navigate to="/" />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar user={user} onLogout={logout} />

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sección 2 — Administración
            </p>
            <h1 className="mt-1 text-2xl font-bold text-foreground font-[family-name:var(--font-heading)]">
              Vehículos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Alta, edición y baja de vehículos (persistencia en{" "}
              <code className="rounded bg-muted px-1">server/db.json</code>).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/dashboard">Volver al panel</Link>
            </Button>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Registrar vehículo
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="text-lg font-semibold text-card-foreground font-[family-name:var(--font-heading)]">
              Listado
            </h2>
            <p className="mt-1 text-xs text-muted-foreground md:hidden">
              Toca una fila para ver el detalle completo y las acciones.
            </p>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="px-5 py-8 text-sm text-muted-foreground">Cargando vehículos…</p>
            ) : vehicles.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted-foreground">
                No hay vehículos. Usa &quot;Registrar vehículo&quot; para agregar el primero.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="hidden px-5 py-3 font-medium text-muted-foreground md:table-cell">ID</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">Placa</th>
                    <th className="hidden px-5 py-3 font-medium text-muted-foreground md:table-cell">Marca / Modelo</th>
                    <th className="hidden px-5 py-3 font-medium text-muted-foreground md:table-cell">Color</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">Propietario</th>
                    <th className="hidden px-5 py-3 font-medium text-muted-foreground md:table-cell">Unidad</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">Cajón</th>
                    <th className="hidden px-5 py-3 font-medium text-muted-foreground md:table-cell">Registro</th>
                    <th className="hidden w-[120px] px-5 py-3 font-medium text-muted-foreground md:table-cell">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVehicles.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b last:border-b-0 transition-colors hover:bg-muted/30 max-md:cursor-pointer md:cursor-default"
                      onClick={(e) => {
                        if (!isMobileViewport()) return;
                        if (e.target instanceof Element && e.target.closest("button,a")) return;
                        setDetailVehicle(v);
                      }}
                    >
                      <td className="hidden px-5 py-3 font-mono text-xs text-muted-foreground md:table-cell">
                        {v.id}
                      </td>
                      <td className="px-5 py-3 font-semibold text-accent">{v.plate}</td>
                      <td className="hidden px-5 py-3 md:table-cell">
                        {v.brand} {v.model}
                      </td>
                      <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{v.color}</td>
                      <td className="px-5 py-3">{v.ownerName}</td>
                      <td className="hidden px-5 py-3 md:table-cell">{v.unit}</td>
                      <td className="px-5 py-3">
                        {v.spotNumber ? (
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {v.spotNumber}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{v.registeredAt}</td>
                      <td className="hidden px-5 py-3 md:table-cell" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(v)}
                            aria-label="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(v)}
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && vehicles.length > 0 && (
            <div className="flex flex-col gap-4 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {rangeFrom}–{rangeTo}
                </span>{" "}
                de <span className="font-medium text-foreground tabular-nums">{total}</span> vehículos
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <label
                  htmlFor="vehicles-page-size"
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="whitespace-nowrap">Filas por página</span>
                  <select
                    id="vehicles-page-size"
                    value={pageSize}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (n === 5 || n === 10 || n === 25) {
                        setPageSize(n);
                        setPage(1);
                      }
                    }}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="min-w-[7rem] text-center text-sm tabular-nums text-muted-foreground">
                    Página <span className="font-medium text-foreground">{page}</span> de{" "}
                    <span className="font-medium text-foreground">{totalPages}</span>
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Página siguiente"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <VehicleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        vehicle={editing}
        onSaved={() => void load()}
      />

      <Dialog open={!!detailVehicle} onOpenChange={(open) => !open && setDetailVehicle(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          {detailVehicle && (
            <>
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)]">Detalle del vehículo</DialogTitle>
                <DialogDescription>Placa {detailVehicle.plate}</DialogDescription>
              </DialogHeader>
              <dl className="grid gap-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">ID</dt>
                  <dd className="font-mono text-right text-xs">{detailVehicle.id}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Placa</dt>
                  <dd className="text-right font-semibold text-accent">{detailVehicle.plate}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Marca / modelo</dt>
                  <dd className="text-right">
                    {detailVehicle.brand} {detailVehicle.model}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Color</dt>
                  <dd className="text-right">{detailVehicle.color}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Propietario</dt>
                  <dd className="text-right">{detailVehicle.ownerName}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Unidad</dt>
                  <dd className="text-right">{detailVehicle.unit}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Cajón</dt>
                  <dd className="text-right">
                    {detailVehicle.spotNumber ? (
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {detailVehicle.spotNumber}
                      </span>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Registro</dt>
                  <dd className="text-right text-muted-foreground">{detailVehicle.registeredAt}</dd>
                </div>
              </dl>
              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <div className="flex w-full gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDetailVehicle(null)}
                  >
                    Cerrar
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    className="flex-1 gap-2"
                    onClick={() => openEdit(detailVehicle)}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => {
                    setDeleteTarget(detailVehicle);
                    setDetailVehicle(null);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitará el registro de la placa{" "}
              <strong>{deleteTarget?.plate}</strong> del archivo de datos. Esta acción no se puede deshacer desde la
              interfaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting ? "Eliminando…" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

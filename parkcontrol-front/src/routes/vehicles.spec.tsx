/**
 * Pruebas unitarias — Administración de vehículos (`/vehicles`).
 * Objetivo: cubrir ramas principales para reportes de cobertura (p. ej. SonarQube + lcov).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import type { User, Vehicle } from "@/services/mockData";

const mockUseAuth = vi.hoisted(() => vi.fn());
const mockListVehicles = vi.hoisted(() => vi.fn());
const mockDeleteVehicle = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/api")>();
  return {
    ...actual,
    listVehicles: (...args: Parameters<typeof actual.listVehicles>) => mockListVehicles(...args),
    deleteVehicle: (...args: Parameters<typeof actual.deleteVehicle>) => mockDeleteVehicle(...args),
  };
});

vi.mock("@/components/VehicleFormDialog", () => ({
  VehicleFormDialog: () => null,
}));

vi.mock("@/assets/logo-parkcontrol.png", () => ({ default: "mock-logo.png" }));

function mockMatchMediaDesktop() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function mockMatchMediaMobile() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("max-width") && query.includes("767"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function buildVehicle(i: number): Vehicle {
  const day = String((i % 27) + 1).padStart(2, "0");
  return {
    id: String(i),
    plate: `TST-${String(i).padStart(3, "0")}`,
    brand: "Marca",
    model: `Modelo ${i}`,
    color: "Gris",
    ownerName: `Propietario ${i}`,
    unit: `${200 + i}-A`,
    registeredAt: `2025-06-${day}`,
    spotNumber: i % 3 === 0 ? undefined : `C-${i}`,
  };
}

function buildUser(): User {
  return {
    id: "1",
    name: "Usuario Prueba",
    email: "test@parkcontrol.test",
    role: "Administrador",
    condominium: "Condominio Demo",
  };
}

function createTestRouter(initialPath = "/vehicles") {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    context: {},
    defaultPreloadStaleTime: 0,
    scrollRestoration: false,
  });
}

type RenderVehiclesOptions = { viewport?: "desktop" | "mobile" };

function renderAtVehicles(options?: RenderVehiclesOptions) {
  if (options?.viewport === "mobile") {
    mockMatchMediaMobile();
  } else {
    mockMatchMediaDesktop();
  }
  const router = createTestRouter("/vehicles");
  const utils = render(<RouterProvider router={router} />);
  return { router, user: userEvent.setup(), ...utils };
}

describe("Vista /vehicles — Administración de vehículos", () => {
  beforeEach(() => {
    mockMatchMediaDesktop();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(),
      user: buildUser(),
      ready: true,
      loading: false,
      error: null,
    });
    mockListVehicles.mockReset();
    mockDeleteVehicle.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("no invoca listVehicles si el usuario no está autenticado", async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      logout: vi.fn(),
      user: null,
      ready: true,
      loading: false,
      error: null,
    });
    mockListVehicles.mockResolvedValue([]);
    renderAtVehicles();
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /^vehículos$/i })).not.toBeInTheDocument();
    });
    expect(mockListVehicles).not.toHaveBeenCalled();
  });

  it("no muestra el panel mientras ready es false", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(),
      user: buildUser(),
      ready: false,
      loading: false,
      error: null,
    });
    mockListVehicles.mockResolvedValue([buildVehicle(1)]);
    renderAtVehicles();
    expect(screen.queryByRole("heading", { name: /^vehículos$/i })).not.toBeInTheDocument();
  });

  it("muestra carga y luego el listado cuando la API resuelve", async () => {
    let resolveList!: (v: Vehicle[]) => void;
    const deferred = new Promise<Vehicle[]>((r) => {
      resolveList = r;
    });
    mockListVehicles.mockReturnValue(deferred);
    renderAtVehicles();
    expect(await screen.findByText(/cargando vehículos/i)).toBeInTheDocument();
    resolveList!([buildVehicle(1), buildVehicle(2)]);
    await waitFor(() => {
      expect(screen.queryByText(/cargando vehículos/i)).not.toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: /^vehículos$/i })).toBeInTheDocument();
    expect(screen.getByText("TST-001")).toBeInTheDocument();
    expect(screen.getByText("TST-002")).toBeInTheDocument();
  });

  it("muestra estado vacío cuando no hay vehículos", async () => {
    mockListVehicles.mockResolvedValue([]);
    renderAtVehicles();
    expect(await screen.findByText(/no hay vehículos/i)).toBeInTheDocument();
    expect(screen.queryByText(/mostrando/i)).not.toBeInTheDocument();
  });

  it("muestra mensaje de error si listVehicles falla", async () => {
    mockListVehicles.mockRejectedValue(new Error("Error de red"));
    renderAtVehicles();
    expect(await screen.findByText("Error de red")).toBeInTheDocument();
  });

  it("muestra columnas de escritorio y texto de paginación", async () => {
    const data = Array.from({ length: 12 }, (_, i) => buildVehicle(i + 1));
    mockListVehicles.mockResolvedValue(data);
    renderAtVehicles();
    await screen.findByText("TST-001");
    expect(screen.getByRole("columnheader", { name: /marca \/ modelo/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /acciones/i })).toBeInTheDocument();
    expect(screen.getByText(/1–10/)).toBeInTheDocument();
    expect(screen.getByText(/de\s*12\s*vehículos/i)).toBeInTheDocument();
  });

  it("paginación: avanza y retrocede entre páginas", async () => {
    const data = Array.from({ length: 12 }, (_, i) => buildVehicle(i + 1));
    mockListVehicles.mockResolvedValue(data);
    const { user } = renderAtVehicles();
    await screen.findByText("TST-001");
    expect(screen.queryByText("TST-011")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /página siguiente/i }));
    await screen.findByText("TST-011");
    expect(screen.getByText(/11–12/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /página anterior/i }));
    await waitFor(() => {
      expect(screen.getByText("TST-010")).toBeInTheDocument();
    });
    expect(screen.queryByText("TST-011")).not.toBeInTheDocument();
  });

  it("paginación: cambia filas por página y reinicia a la primera página", async () => {
    const data = Array.from({ length: 12 }, (_, i) => buildVehicle(i + 1));
    mockListVehicles.mockResolvedValue(data);
    const { user } = renderAtVehicles();
    await screen.findByText("TST-001");
    await user.click(screen.getByRole("button", { name: /página siguiente/i }));
    await screen.findByText("TST-011");
    await user.selectOptions(screen.getByLabelText(/filas por página/i), "5");
    await waitFor(() => {
      expect(screen.getByText(/1–5/)).toBeInTheDocument();
    });
    expect(screen.getByText("TST-005")).toBeInTheDocument();
    expect(screen.queryByText("TST-006")).not.toBeInTheDocument();
  });

  it("elimina tras confirmar en AlertDialog y vuelve a cargar el listado", async () => {
    let loadCall = 0;
    mockListVehicles.mockImplementation(async () => {
      loadCall += 1;
      if (loadCall === 1) return [buildVehicle(1), buildVehicle(2)];
      return [buildVehicle(2)];
    });
    mockDeleteVehicle.mockResolvedValue(undefined);
    const { user } = renderAtVehicles();
    await screen.findByText("TST-001");
    const dataRows = screen.getAllByRole("row").slice(1);
    const first = dataRows[0];
    if (!first) throw new Error("sin filas");
    await user.click(within(first).getByRole("button", { name: /eliminar/i }));
    const alert = await screen.findByRole("alertdialog");
    expect(within(alert).getByText(/¿eliminar vehículo/i)).toBeInTheDocument();
    await user.click(within(alert).getByRole("button", { name: /^eliminar$/i }));
    await waitFor(() => {
      expect(mockDeleteVehicle).toHaveBeenCalledWith("1");
    });
    await waitFor(() => {
      expect(screen.queryByText("TST-001")).not.toBeInTheDocument();
    });
    expect(screen.getByText("TST-002")).toBeInTheDocument();
  });

  it("móvil: abre modal de detalle al pulsar la fila", async () => {
    mockListVehicles.mockResolvedValue([buildVehicle(7)]);
    const { user } = renderAtVehicles({ viewport: "mobile" });
    expect(await screen.findByText(/toca una fila/i)).toBeInTheDocument();
    const row = screen.getByText("TST-007").closest("tr");
    expect(row).toBeTruthy();
    await user.click(row!);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/detalle del vehículo/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/propietario 7/i)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /cerrar/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("enlace Volver al panel apunta al dashboard", async () => {
    mockListVehicles.mockResolvedValue([buildVehicle(1)]);
    renderAtVehicles();
    await screen.findByText("TST-001");
    expect(screen.getByRole("link", { name: /volver al panel/i })).toHaveAttribute("href", "/dashboard");
  });

  it("muestra botón Registrar vehículo y sección 2 en subtítulo", async () => {
    mockListVehicles.mockResolvedValue([]);
    renderAtVehicles();
    await screen.findByText(/no hay vehículos/i);
    expect(screen.getByText(/sección 2/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /registrar vehículo/i })).toBeInTheDocument();
  });
});

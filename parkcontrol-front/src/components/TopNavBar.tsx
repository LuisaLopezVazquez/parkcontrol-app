import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Car,
  ParkingSquare,
  FileText,
  Settings,
  LogOut,
  Home,
  Bell,
  Search,
  Menu,
  X,
} from "lucide-react";
import logo from "@/assets/logo-parkcontrol.png";
import type { User } from "@/services/mockData";
import { cn } from "@/lib/utils";

type NavTo = "/dashboard" | "/vehicles";

type NavItem =
  | { kind: "link"; to: NavTo; label: string; icon: typeof Home }
  | { kind: "soon"; label: string; icon: typeof Home };

const menuItems: NavItem[] = [
  { kind: "link", to: "/dashboard", label: "Inicio", icon: Home },
  { kind: "link", to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { kind: "link", to: "/vehicles", label: "Vehículos", icon: Car },
  { kind: "soon", label: "Cajones", icon: ParkingSquare },
  { kind: "soon", label: "Reportes", icon: FileText },
  { kind: "soon", label: "Configuración", icon: Settings },
];

function isActivePath(pathname: string, to: NavTo) {
  if (to === "/vehicles") return pathname === "/vehicles" || pathname.startsWith("/vehicles/");
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

interface TopNavBarProps {
  user: User;
  onLogout: () => void | Promise<void>;
}

export function TopNavBar({ user, onLogout }: TopNavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const pillClass = (active: boolean) =>
    cn(
      "relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200",
      active
        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        <div className="mx-auto max-w-[1600px] px-4 pt-3">
          <div
            className="flex items-center justify-between rounded-2xl border border-foreground/[0.06] px-5 py-2.5 shadow-lg"
            style={{
              background: "oklch(1 0 0 / 0.72)",
              backdropFilter: "blur(20px) saturate(1.8)",
              WebkitBackdropFilter: "blur(20px) saturate(1.8)",
            }}
          >
            <Link to="/dashboard" className="flex shrink-0 items-center gap-2">
              <img src={logo} alt="ParkControl" className="h-20 w-auto" />
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {menuItems.map((item, i) =>
                item.kind === "link" ? (
                  <Link
                    key={`${item.label}-${i}`}
                    to={item.to}
                    className={pillClass(isActivePath(pathname, item.to))}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    key={`${item.label}-${i}`}
                    className={cn(pillClass(false), "cursor-not-allowed opacity-50")}
                    title="Próximamente"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </span>
                ),
              )}
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="hidden rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="relative hidden rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
              </button>

              <div className="mx-2 hidden h-6 w-px bg-border sm:block" />

              <div className="group relative hidden sm:block">
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{user.role}</p>
                  </div>
                </button>

                <div className="invisible absolute right-0 top-full mt-2 w-48 rounded-xl border bg-card p-1.5 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => void onLogout()}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted md:hidden"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="mx-4 mt-2 rounded-2xl border bg-card p-3 shadow-xl md:hidden">
            <nav className="flex flex-col gap-1">
              {menuItems.map((item, i) =>
                item.kind === "link" ? (
                  <Link
                    key={`m-${item.label}-${i}`}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                      isActivePath(pathname, item.to)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ) : (
                  <span
                    key={`m-${item.label}-${i}`}
                    className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-50"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                ),
              )}
            </nav>
            <div className="mt-2 border-t pt-2">
              <button
                type="button"
                onClick={() => void onLogout()}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

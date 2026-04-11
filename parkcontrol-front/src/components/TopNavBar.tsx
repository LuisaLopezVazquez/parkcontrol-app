import { useState } from "react";
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

const menuItems = [
  { label: "Inicio", icon: Home, active: true },
  { label: "Dashboard", icon: LayoutDashboard, active: false },
  { label: "Vehículos", icon: Car, active: false },
  { label: "Cajones", icon: ParkingSquare, active: false },
  { label: "Reportes", icon: FileText, active: false },
  { label: "Configuración", icon: Settings, active: false },
];

interface TopNavBarProps {
  user: User;
  onLogout: () => void | Promise<void>;
}

export function TopNavBar({ user, onLogout }: TopNavBarProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        {/* Glassmorphism bar */}
        <div className="mx-auto max-w-[1600px] px-4 pt-3">
          <div
            className="flex items-center justify-between rounded-2xl border border-foreground/[0.06] px-5 py-2.5 shadow-lg"
            style={{
              background: "oklch(1 0 0 / 0.72)",
              backdropFilter: "blur(20px) saturate(1.8)",
              WebkitBackdropFilter: "blur(20px) saturate(1.8)",
            }}
          >
            {/* Logo */}
            <div className="flex shrink-0 items-center gap-2">
              <img src={logo} alt="ParkControl" className="h-20 w-auto" />
            </div>

            {/* Desktop nav pills */}
            <nav className="hidden items-center gap-1 md:flex">
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                    activeIndex === i
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <button className="hidden rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex">
                <Search className="h-4 w-4" />
              </button>
              <button className="relative hidden rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
              </button>

              <div className="mx-2 hidden h-6 w-px bg-border sm:block" />

              {/* Avatar + dropdown area */}
              <div className="group relative hidden sm:block">
                <button className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{user.role}</p>
                  </div>
                </button>

                {/* Dropdown */}
                <div className="invisible absolute right-0 top-full mt-2 w-48 rounded-xl border bg-card p-1.5 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted md:hidden"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="mx-4 mt-2 rounded-2xl border bg-card p-3 shadow-xl md:hidden">
            <nav className="flex flex-col gap-1">
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveIndex(i);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeIndex === i
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-2 border-t pt-2">
              <button
                onClick={onLogout}
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

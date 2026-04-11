import {
  LayoutDashboard,
  Car,
  ParkingSquare,
  FileText,
  Settings,
  LogOut,
  Home,
} from "lucide-react";
import logo from "@/assets/logo-parkcontrol.png";

const menuItems = [
  { label: "Inicio", icon: Home, active: true },
  { label: "Dashboard", icon: LayoutDashboard, active: false },
  { label: "Vehículos", icon: Car, active: false },
  { label: "Cajones", icon: ParkingSquare, active: false },
  { label: "Reportes", icon: FileText, active: false },
  { label: "Configuración", icon: Settings, active: false },
];

interface AppSidebarProps {
  onLogout: () => void;
}

export function AppSidebar({ onLogout }: AppSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
        <img src={logo} alt="ParkControl" className="h-8 w-auto brightness-0 invert" />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item, i) => (
          <button
            key={i}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              item.active
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

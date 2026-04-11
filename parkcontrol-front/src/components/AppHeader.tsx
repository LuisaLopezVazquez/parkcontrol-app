import { Bell, Search } from "lucide-react";
import type { User } from "@/services/mockData";

interface AppHeaderProps {
  user: User;
}

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card px-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-card-foreground font-[family-name:var(--font-heading)]">
          {user.condominium}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Search className="h-5 w-5" />
        </button>
        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {user.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

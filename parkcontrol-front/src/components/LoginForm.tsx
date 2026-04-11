import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import logo from "@/assets/logo-parkcontrol.png";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function LoginForm({ onLogin, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <img src={logo} alt="ParkControl" className="mx-auto mb-6 h-20 w-auto" />
            <h1 className="text-2xl font-bold text-foreground font-[family-name:var(--font-heading)]">
              Bienvenido a ParkControl
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Control inteligente de estacionamiento para condominios
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Credenciales de prueba</p>
              <p>Correo: <span className="font-mono text-accent">admin@test.com</span></p>
              <p>Contraseña: <span className="font-mono text-accent">1234</span></p>
            </div>
          </form>
        </div>
      </div>

      {/* Right panel - branding */}
      <div className="hidden flex-col items-center justify-center bg-primary p-12 lg:flex lg:w-[45%]">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-accent/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.124-.504 1.125-1.125v-3.026a2.999 2.999 0 0 0-.752-1.99l-3.123-3.498A2.999 2.999 0 0 0 14.747 8H3.375c-.621 0-1.125.504-1.125 1.125v8.5c0 .621.504 1.125 1.125 1.125m16.5-4.5h-5.25a1.125 1.125 0 0 1-1.125-1.125V8.625" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground font-[family-name:var(--font-heading)]">
            Gestión inteligente de estacionamiento
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">
            Administra cajones, registra vehículos y monitorea la ocupación de tu condominio en tiempo real.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-accent">100%</p>
              <p className="text-xs text-primary-foreground/60">Digital</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">24/7</p>
              <p className="text-xs text-primary-foreground/60">Monitoreo</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">Fácil</p>
              <p className="text-xs text-primary-foreground/60">De usar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

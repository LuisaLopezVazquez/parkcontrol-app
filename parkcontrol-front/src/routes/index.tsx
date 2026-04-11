import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoginForm } from "@/components/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ParkControl — Control de Estacionamiento" },
      { name: "description", content: "Sistema inteligente de control de estacionamiento para condominios" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, loading, error, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, ready, navigate]);

  if (!ready) return null;

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    navigate({ to: "/dashboard" });
  };

  return <LoginForm onLogin={handleLogin} loading={loading} error={error} />;
}

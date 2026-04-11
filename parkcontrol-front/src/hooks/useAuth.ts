import { useState, useCallback, useEffect } from "react";
import type { User } from "@/services/mockData";
import * as api from "@/services/api";

const USER_STORAGE_KEY = "parkcontrol_user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = localStorage.getItem(api.STORAGE_ACCESS_TOKEN_KEY);
      if (token) {
        try {
          const u = await api.getCurrentUser();
          if (!cancelled) {
            setUser(u);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
          }
        } catch {
          localStorage.removeItem(api.STORAGE_ACCESS_TOKEN_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          if (!cancelled) setUser(null);
        }
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user: u, accessToken } = await api.login(email, password);
      localStorage.setItem(api.STORAGE_ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
      setUser(u);
      return u;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* red o sesión ya inválida: igual limpiamos cliente */
    } finally {
      localStorage.removeItem(api.STORAGE_ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    }
  }, []);

  return { user, login, logout, loading, error, isAuthenticated: !!user, ready };
}

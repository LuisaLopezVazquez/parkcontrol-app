import { useState, useCallback, useEffect } from "react";
import type { User } from "@/services/mockData";
import * as api from "@/services/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("parkcontrol_user");
    if (stored) setUser(JSON.parse(stored));
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await api.login(email, password);
      setUser(u);
      localStorage.setItem("parkcontrol_user", JSON.stringify(u));
      return u;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("parkcontrol_user");
  }, []);

  return { user, login, logout, loading, error, isAuthenticated: !!user, ready };
}

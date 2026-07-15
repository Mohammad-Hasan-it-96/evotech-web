"use client";

import * as React from "react";
import { fetchMe, loginRequest, logoutRequest } from "@/lib/api/auth";
import type { AuthUser } from "@/lib/api/types";
import { clearToken, getToken, setToken } from "./storage";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Restore the session from a stored token on first mount.
  React.useEffect(() => {
    let active = true;

    (async () => {
      if (!getToken()) {
        if (active) setIsLoading(false);
        return;
      }
      try {
        const { data } = await fetchMe();
        if (active) setUser(data);
      } catch {
        clearToken();
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const { data } = await loginRequest(email, password);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Revoking server-side is best-effort; always clear locally.
    }
    clearToken();
    setUser(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { authApi, SafeUser } from "@/services/auth.api";

/**
 * AuthContext — Global auth state (Phase 2).
 *
 * Strategy:
 *  - accessToken kept in memory (never localStorage) for XSS protection
 *  - refreshToken lives in httpOnly cookie (managed by the browser/backend)
 *  - On app mount, we call /auth/refresh to silently restore a session
 *
 * Usage:
 *   const { user, accessToken, login, logout, isLoading } = useAuth();
 */

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthState {
  user: SafeUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (user: SafeUser, accessToken: string) => void;
  clearAuth: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true until initial refresh check

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setAuth = useCallback((authUser: SafeUser, token: string) => {
    setUser(authUser);
    setAccessToken(token);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  // ── Restore session on mount ───────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const data = await authApi.refresh();
        if (!cancelled) {
          setAuth(data.user, data.accessToken);
        }
      } catch {
        // No valid session — clear state silently
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth actions ───────────────────────────────────────────────────────────

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authApi.login({ email, password });
      setAuth(data.user, data.accessToken);
    },
    [setAuth]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await authApi.register({ name, email, password });
      // Registration doesn't auto-login — user must log in after
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  // ── Context value ──────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login,
    register,
    logout,
    setAuth,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

"use client";

import { setAuthCookie, clearAuthCookie } from "@/lib/auth-cookie";
import {
  clearTokens,
  setAccessToken,
  setRefreshToken,
} from "@/lib/auth-tokens";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/** Unsigned JWT payload `{ "roles": ["admin"] }` so middleware role checks pass. */
const MOCK_SESSION_JWT =
  "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJyb2xlcyI6WyJhZG1pbiJdfQ.";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aisleris-auth-user");
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        if (parsed?.email) setUserState(parsed);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (user) {
      localStorage.setItem("aisleris-auth-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("aisleris-auth-user");
    }
  }, [user, ready]);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    clearAuthCookie();
    setUserState(null);
    localStorage.removeItem("aisleris-auth-user");
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    const trimmed = email.trim();
    const safeEmail = trimmed || "user@local.invalid";
    setAccessToken(MOCK_SESSION_JWT);
    setRefreshToken(null);
    setAuthCookie(MOCK_SESSION_JWT);
    setUserState({
      id: "local",
      email: safeEmail,
      name: safeEmail.split("@")[0] ?? "User",
      roles: ["admin"],
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      logout,
      setUser,
    }),
    [user, ready, login, logout, setUser],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

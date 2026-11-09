"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getSession, signOut as endSession } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";

/**
 * Who is signed in, for every client component. Global client state, so
 * Context (coding standard, State management).
 *
 * `loading` until the session has been read once. The pages are static, so the
 * server never knows who is looking; the header holds its place until this
 * settles rather than flashing JOIN at someone who is signed in.
 */
type AuthState = {
  status: "loading" | "signed-in" | "signed-out";
  user: AuthUser | null;
  /** After a sign-in, a confirmed email or a Google return. */
  setUser: (user: AuthUser) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queries = useQueryClient();
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    getSession()
      .catch(() => null)
      .then((session) => {
        if (!live) return;
        setUserState(session);
        setLoaded(true);
      });
    return () => {
      live = false;
    };
  }, []);

  const setUser = useCallback((next: AuthUser) => setUserState(next), []);
  const signOut = useCallback(async () => {
    await endSession();
    setUserState(null);
    // The player's own data (profile, cart, registrations) goes with them.
    queries.clear();
  }, [queries]);

  const value = useMemo<AuthState>(
    () => ({ status: !loaded ? "loading" : user ? "signed-in" : "signed-out", user, setUser, signOut }),
    [loaded, user, setUser, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

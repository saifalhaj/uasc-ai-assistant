'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  stationId: string;
  displayName: string;
  level: 'L2' | 'L3' | 'L4';
  clearanceLabel: string; // e.g. "L4 · OPS-LEAD"
}

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({ user: null, loading: true, logout: async () => {} });

export function useAuth(): AuthCtx {
  return useContext(AuthContext);
}

/** True if the user's level is at least `min` (L2 < L3 < L4). */
export function hasLevel(user: AuthUser | null, min: 'L2' | 'L3' | 'L4'): boolean {
  if (!user) return false;
  const rank = { L2: 2, L3: 3, L4: 4 };
  return (rank[user.level] ?? 0) >= rank[min];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

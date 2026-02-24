'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type AuthUser = { id: string; email: string; role?: string; name?: string };

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (payload: { accessToken: string; refreshToken?: string; user?: AuthUser }) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFromStorage = () => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('user_token');
    const refresh = window.localStorage.getItem('user_refresh_token');
    const profile = window.localStorage.getItem('user_profile');
    setAccessToken(token);
    setRefreshToken(refresh);
    setUser(profile ? (JSON.parse(profile) as AuthUser) : null);
    setLoading(false);
  };

  useEffect(() => {
    loadFromStorage();
    const onRefreshed = () => loadFromStorage();
    window.addEventListener('auth-token-refreshed', onRefreshed);
    return () => window.removeEventListener('auth-token-refreshed', onRefreshed);
  }, []);

  const login = (payload: { accessToken: string; refreshToken?: string; user?: AuthUser }) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('user_token', payload.accessToken);
      if (payload.refreshToken) {
        window.localStorage.setItem('user_refresh_token', payload.refreshToken);
      }
      if (payload.user) {
        window.localStorage.setItem('user_profile', JSON.stringify(payload.user));
      }
    }
    setAccessToken(payload.accessToken);
    setRefreshToken(payload.refreshToken ?? null);
    if (payload.user) setUser(payload.user);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('user_token');
      window.localStorage.removeItem('user_refresh_token');
      window.localStorage.removeItem('user_profile');
    }
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      refreshToken,
      loading,
      login,
      logout,
      setUser,
    }),
    [user, accessToken, refreshToken, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}


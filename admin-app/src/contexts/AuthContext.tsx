import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/endpoints';

type User = { id: string; email: string; role: string; name?: string };

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem(USER_KEY);
    if (u && token) {
      try {
        setUser(JSON.parse(u));
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (!res.success) return res.error || 'Login failed';
    const d = (res.data || {}) as { accessToken?: string; refreshToken?: string; user?: User };
    const t = d.accessToken;
    const u = d.user;
    if (!t || !u) return 'Invalid response';
    if (u.role !== 'ADMIN' && u.role !== 'STAFF') return 'Access denied. Admin or Staff only.';
    localStorage.setItem(TOKEN_KEY, t);
    if (d.refreshToken) localStorage.setItem('admin_refresh_token', d.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
    return null;
  }, []);

  const logout = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    const rt = localStorage.getItem('admin_refresh_token');
    if (t && rt) await authApi.logout(t, rt).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('admin_refresh_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

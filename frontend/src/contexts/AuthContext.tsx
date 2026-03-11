import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getMe, setToken, clearToken, type User } from '../lib/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const u = await getMe();
      setUser(u);
    } catch {
      setUser(null);
      clearToken();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginFn = (token: string, u: User) => {
    setToken(token);
    setUser(u);
  };

  const logoutFn = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login: loginFn, logout: logoutFn, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

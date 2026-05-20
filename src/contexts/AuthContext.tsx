import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getMe } from '../api/auth';
import { storeTokens, clearTokens, getAccessToken } from '../api/client';
import type { AppUser, AuthResponse } from '../types/api';

type Role = 'ROLE_CUSTOMER' | 'ROLE_MERCHANT' | 'ROLE_ADMIN' | null;

interface AuthContextValue {
  user: AppUser | null;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (response: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) { setIsLoading(false); return; }

    getMe()
      .then(user => setUser(user))
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false));
  }, []);

  const login = (response: AuthResponse) => {
    storeTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const role: Role = user
    ? (user.roles.find(r => ['ROLE_CUSTOMER', 'ROLE_MERCHANT', 'ROLE_ADMIN'].includes(r)) as Role ?? null)
    : null;

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

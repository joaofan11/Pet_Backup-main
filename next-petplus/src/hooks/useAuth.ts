import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthData, User } from '@/types';
import { apiFetch } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (data: { name: string; email: string; phone: string; password: string; confirmPassword: string }) => Promise<string>;
  logout: () => void;
  updateProfile: (formData: FormData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('petplus_auth');
    if (stored) {
      try {
        const data: AuthData = JSON.parse(stored);
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('petplus_token', data.token);
      } catch {
        localStorage.removeItem('petplus_auth');
        localStorage.removeItem('petplus_token');
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string> => {
    const data = await apiFetch<AuthData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('petplus_auth', JSON.stringify(data));
    localStorage.setItem('petplus_token', data.token);
    return data.message || 'Login realizado com sucesso!';
  }, []);

  const register = useCallback(async (data: { name: string; email: string; phone: string; password: string; confirmPassword: string }): Promise<string> => {
    const result = await apiFetch<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.message || 'Conta criada com sucesso!';
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('petplus_auth');
    localStorage.removeItem('petplus_token');
  }, []);

  const updateProfile = useCallback(async (formData: FormData) => {
    const data = await apiFetch<AuthData>('/auth/update', {
      method: 'PUT',
      body: formData,
      isFormData: true,
    });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('petplus_auth', JSON.stringify(data));
    localStorage.setItem('petplus_token', data.token);
  }, []);

  const refreshUser = useCallback(async () => {
    const userData = await apiFetch<User>('/auth/me');
    setUser(userData);
    const stored = localStorage.getItem('petplus_auth');
    if (stored) {
      const authData = JSON.parse(stored);
      authData.user = userData;
      localStorage.setItem('petplus_auth', JSON.stringify(authData));
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

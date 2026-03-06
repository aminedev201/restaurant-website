'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { User, AuthState, LoginCredentials, RegisterData, ApiResponse } from '@/types';
import { secureSet, secureGet, secureRemove } from '@/lib/encryption';
import api from '@/lib/api';
import { STORAGE_KEY, useCart } from './CartContext';

interface AuthContextType extends AuthState {
  login: (c: LoginCredentials) => Promise<ApiResponse<{ user: User; access_token: string }>>;
  register: (d: RegisterData) => Promise<ApiResponse<{ user: User }>>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<ApiResponse<null>>;
  resetPassword: (d: { token: string; email: string; password: string; password_confirmation: string }) => Promise<ApiResponse<null>>;
  resendVerification: (email: string) => Promise<ApiResponse<null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, isAuthenticated: false, isLoading: true });
  const { clearCart } = useCart();
  
   useEffect(() => {
    (async () => {
      const token = Cookies.get('auth_token');
      if (token) {
        const user = await secureGet<User>('user_info') ?? await secureGet<User>('admin_info');
        if (user) {
          setState({ user, token, isAuthenticated: true, isLoading: false });
          return;
        }
        Cookies.remove('auth_token');
      }
      setState(s => ({ ...s, isLoading: false }));
    })();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { data } = await api.post<ApiResponse<{ user: User; access_token: string; expires_at: string; remember: boolean }>>('/login', credentials);
    if (data.success && data.data) {
      const { user, access_token, remember } = data.data;
      Cookies.set('auth_token', access_token, { expires: remember ? 30 : 1, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      const storageKey = user.role === 'admin' ? 'admin_info' : 'user_info';
      await secureSet(storageKey, user);
      setState({ user, token: access_token, isAuthenticated: true, isLoading: false });
    }
    return data;
  }, []);

  const register = useCallback(async (registerData: RegisterData) => {
    const { data } = await api.post<ApiResponse<{ user: User }>>('/register', registerData);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/logout'); } catch {}
    Cookies.remove('auth_token');
    secureRemove('user_info');
    secureRemove('admin_info');
    // Clear cart data on logout so it doesn't persist across accounts
    clearCart();
  }, []);

  // ── Re-fetches the authenticated user from the API and updates state + storage ──
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<ApiResponse<User>>('/admin/profile');
      if (data.success && data.data) {
        const user = data.data;
        const storageKey = user.role === 'admin' ? 'admin_info' : 'user_info';
        await secureSet(storageKey, user);
        setState(s => ({ ...s, user }));
      }
    } catch {}
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const { data } = await api.post<ApiResponse<null>>('/forgot-password', { email });
    return data;
  }, []);

  const resetPassword = useCallback(async (d: { token: string; email: string; password: string; password_confirmation: string }) => {
    const { data } = await api.post<ApiResponse<null>>('/reset-password', d);
    return data;
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    const { data } = await api.post<ApiResponse<null>>('/email/resend', { email });
    return data;
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser, forgotPassword, resetPassword, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
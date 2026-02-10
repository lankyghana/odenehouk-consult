import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAuthContext } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    isLoading: true,
  });

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Attempt to refresh token to check if user has valid session
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          accessToken: data.accessToken,
          isLoading: false,
        });
      } else {
        // No valid session
        setAuthState({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        isLoading: false,
      });
    }
  };

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await res.json();
      setAuthState({
        isAuthenticated: true,
        user: data.user,
        accessToken: data.accessToken,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Registration failed');
      }

      // After registration, automatically log in
      return await login(email, password);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        isLoading: false,
      });
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setAuthState((prev) => ({
          ...prev,
          accessToken: data.accessToken,
          user: data.user,
        }));
        return data.accessToken;
      } else {
        // Refresh failed - logout
        await logout();
        return null;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return null;
    }
  }, [logout]);

  const getAccessToken = useCallback(async () => {
    // Return current token if available
    if (authState.accessToken) {
      return authState.accessToken;
    }
    // Otherwise try to refresh
    return await refreshToken();
  }, [authState.accessToken, refreshToken]);

  const value = {
    ...authState,
    login,
    register,
    logout,
    refreshToken,
    getAccessToken,
    isAdmin: authState.user?.role === 'admin',
  };

  // Initialize API helper with auth context
  useEffect(() => {
    setAuthContext(value);
  }, [value]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

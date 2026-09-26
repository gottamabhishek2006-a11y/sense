import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('civicfix_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('civicfix_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and verify authentication on app load
  useEffect(() => {
    const verifyUserSession = async () => {
      const storedToken = localStorage.getItem('civicfix_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authAPI.getMe();
        if (response.success && response.user) {
          setUser(response.user);
          localStorage.setItem('civicfix_user', JSON.stringify(response.user));
        } else {
          // Token invalid
          logout();
        }
      } catch (err) {
        console.warn('[AuthContext] Session expired or invalid:', err.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyUserSession();

    // Listen for global session expiration events from Axios interceptor
    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
      setError('Your session has expired. Please sign in again.');
    };

    window.addEventListener('civicfix:session_expired', handleSessionExpired);
    return () => window.removeEventListener('civicfix:session_expired', handleSessionExpired);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signup = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authAPI.signup(userData);
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('civicfix_token', data.token);
        localStorage.setItem('civicfix_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Signup failed' };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to create account. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authAPI.login(credentials);
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('civicfix_token', data.token);
        localStorage.setItem('civicfix_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Invalid credentials. Please verify and try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Continue client cleanup regardless of server response
    } finally {
      localStorage.removeItem('civicfix_token');
      localStorage.removeItem('civicfix_user');
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin', // Strict check — 'authorized' role no longer grants admin
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

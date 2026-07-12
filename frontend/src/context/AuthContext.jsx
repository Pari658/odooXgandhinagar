import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/apiClient';

const TOKEN_KEY = 'token';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  }, []);

  const applySession = useCallback((token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
    setRole(userData.role);
    setIsAuthenticated(true);
  }, []);

  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
        setRole(response.data.data.role);
        setIsAuthenticated(true);
      } else {
        clearSession();
      }
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed.');
    }

    const { token, user: userData } = response.data.data;
    applySession(token, userData);
    return userData;
  };

  const register = async (email, password, name, assignedRole) => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      name,
      role: assignedRole,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Registration failed.');
    }

    const { token, user: userData } = response.data.data;
    applySession(token, userData);
    return userData;
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAppAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAppAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

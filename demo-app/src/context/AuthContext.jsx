import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { identify, register } from '../services/authService';

const TOKEN_STORAGE_KEY = 'fac.auth.token';
const USER_STORAGE_KEY = 'fac.auth.user';

const AuthContext = createContext(null);

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [user, setUser] = useState(loadStoredUser);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const applySession = (payload) => {
    setToken(payload?.token || '');
    setUser(payload?.user || null);
  };

  const clearSession = () => {
    setToken('');
    setUser(null);
  };

  const tryOidcLogin = async () => false;

  const identifyLogin = async (employeeNumber) => {
    setAuthLoading(true);
    try {
      const payload = await identify(employeeNumber);
      applySession(payload);
      return payload;
    } finally {
      setAuthLoading(false);
    }
  };

  const registerAccount = async (formData) => {
    setAuthLoading(true);
    try {
      const payload = await register(formData);
      applySession(payload);
      return payload;
    } finally {
      setAuthLoading(false);
    }
  };

  const hasPermission = (featureName) => Boolean(user?.permissions?.[featureName]);

  const logout = () => {
    clearSession();
  };

  const value = useMemo(
    () => ({
      token,
      user,
      authLoading,
      isAuthenticated: Boolean(token && user),
      tryOidcLogin,
      identifyLogin,
      registerAccount,
      logout,
      hasPermission,
    }),
    [token, user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

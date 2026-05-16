import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const storeToken = (token) => sessionStorage.setItem('accessToken', token);
  const clearToken = ()      => sessionStorage.removeItem('accessToken');

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    storeToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    // Try to restore session — always finish loading regardless of outcome
    authApi.refresh()
      .then(({ data }) => {
        storeToken(data.data.accessToken);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

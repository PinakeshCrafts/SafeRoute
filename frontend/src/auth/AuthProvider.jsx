import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) {
        setMe(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const user = await getMe(token);
        if (!cancelled) setMe(user);
      } catch {
        if (!cancelled) {
          setMe(null);
          setToken('');
          localStorage.removeItem('token');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      me,
      loading,
      setSession: (newToken) => {
        setToken(newToken);
        if (newToken) localStorage.setItem('token', newToken);
        else localStorage.removeItem('token');
      },
      logout: () => {
        setMe(null);
        setToken('');
        localStorage.removeItem('token');
      },
      refreshMe: async () => {
        if (!token) return null;
        const user = await getMe(token);
        setMe(user);
        return user;
      },
    }),
    [token, me, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';

const STORAGE_KEY = 'urechki_mobile_user';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && raw) setUser(JSON.parse(raw));
      } catch {
        // Битый кеш не должен мешать входу — просто начинаем как гость.
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  const persist = useCallback(async (next) => {
    setUser(next);
    try {
      if (next) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Приватный режим может запретить запись — сессия живёт до перезапуска.
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const next = await api.login(email, password);
    await persist(next);
    return next;
  }, [persist]);

  const register = useCallback(async (data) => {
    const next = await api.register(data);
    await persist(next);
    return next;
  }, [persist]);

  const logout = useCallback(() => persist(null), [persist]);

  const value = useMemo(() => ({
    user,
    ready,
    isOwner: user?.role === 'Владелец',
    login,
    register,
    logout,
  }), [user, ready, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return context;
}

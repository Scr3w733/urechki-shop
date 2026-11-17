import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const USER_KEY = 'urechki_active_user';

const readJson = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJson(USER_KEY, null));
  const [wishlist, setWishlist] = useState(() => readJson('urechki_wishlist', []));

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  // Поддерживаем старые ключи wishlist по email: переносим их в общий список.
  useEffect(() => {
    if (!user?.email) return;
    const oldKey = `urechki_wishlist_${user.email}`;
    const oldItems = readJson(oldKey, []);
    if (oldItems.length) {
      setWishlist(prev => {
        const merged = [...prev];
        oldItems.forEach(item => { if (!merged.some(p => p.id === item.id)) merged.push(item); });
        return merged;
      });
      localStorage.removeItem(oldKey);
    }
  }, [user?.email]);

  useEffect(() => {
    localStorage.setItem('urechki_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const persistUser = useCallback((data) => {
    setUser(data);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/customers/login', { email, password });
      persistUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Ошибка входа' };
    }
  };

  const register = async (name, email, password, role = 'Клиент') => {
    try {
      const response = await axios.post('/api/customers/register', {
        name, email, password, role,
        phone: '+70000000000',
      });
      persistUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Ошибка регистрации' };
    }
  };

  const logout = useCallback(() => setUser(null), []);

  const refreshUser = useCallback(async () => {
    if (!user?.id) return null;
    try {
      const { data } = await axios.get(`/api/customers/${user.id}`);
      persistUser(data);
      return data;
    } catch {
      return null;
    }
  }, [user?.id, persistUser]);

  const updateProfile = useCallback(async (payload) => {
    if (!user?.id) return { success: false, message: 'Войдите в аккаунт' };
    try {
      const { data } = await axios.put(`/api/customers/${user.id}`, payload);
      persistUser(data);
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Не удалось сохранить профиль' };
    }
  }, [user?.id, persistUser]);

  // --- ИСТОРИЯ ЗАКАЗОВ (локальный кеш для быстрого UI) ---
  const addOrderToHistory = useCallback((orderData) => {
    if (!user?.email) return;
    const key = `urechki_orders_${user.email}`;
    const existing = readJson(key, []);
    localStorage.setItem(key, JSON.stringify([orderData, ...existing]));
  }, [user?.email]);

  const getUserOrders = useCallback(() => {
    if (!user?.email) return [];
    return readJson(`urechki_orders_${user.email}`, []);
  }, [user?.email]);

  // --- ПРОМОКОДЫ ---
  const addPromoToUser = useCallback((promo) => {
    if (!user?.email) return;
    const key = `urechki_promos_${user.email}`;
    const existing = readJson(key, []);
    localStorage.setItem(key, JSON.stringify([promo, ...existing]));
  }, [user?.email]);

  const getUserPromos = useCallback(() => {
    if (!user?.email) return [];
    return readJson(`urechki_promos_${user.email}`, []);
  }, [user?.email]);

  const removePromoFromUser = useCallback((code) => {
    if (!user?.email) return;
    const key = `urechki_promos_${user.email}`;
    const existing = readJson(key, []);
    localStorage.setItem(key, JSON.stringify(existing.filter(p => p.promoCode !== code)));
  }, [user?.email]);

  // --- ИЗБРАННОЕ ---
  const toggleWishlist = useCallback((product) => {
    if (!user) return;
    setWishlist(prev => prev.some(p => p.id === product.id)
      ? prev.filter(p => p.id !== product.id)
      : [...prev, product]);
  }, [user]);

  const getWishlist = useCallback(() => wishlist, [wishlist]);
  const isInWishlist = useCallback((id) => wishlist.some(p => p.id === id), [wishlist]);

  const getUserBonusBalance = useCallback(() => {
    if (user?.bonusPoints != null) return Number(user.bonusPoints);
    return getUserOrders().reduce((sum, order) => {
      const earned = order.bonusesEarned ?? (Number(order.originalTotal) * 0.1) ?? 0;
      return sum + Number(earned) - Number(order.bonusesSpent || 0);
    }, 0);
  }, [user?.bonusPoints, getUserOrders]);

  const isAdmin = user?.role === 'Владелец' || user?.role === 'Админ' || user?.role === 'Admin';

  return (
    <AuthContext.Provider value={{
      user, isAdmin, login, register, logout, refreshUser, updateProfile,
      addOrderToHistory, getUserOrders,
      addPromoToUser, getUserPromos, removePromoFromUser,
      toggleWishlist, getWishlist, isInWishlist, getUserBonusBalance,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

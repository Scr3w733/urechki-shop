import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('urechki_active_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.email) setUser(parsedUser);
      }
    } catch (e) {
      console.log("Ошибка чтения пользователя", e);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8081/api/customers/login', { email, password });
      setUser(response.data);
      localStorage.setItem('urechki_active_user', JSON.stringify(response.data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Ошибка входа" };
    }
  };

  const register = async (name, email, password, role = 'Клиент') => {
    try {
      const response = await axios.post('http://localhost:8081/api/customers/register', {
        name, email, password, role, phone: "+70000000000"
      });
      setUser(response.data);
      localStorage.setItem('urechki_active_user', JSON.stringify(response.data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Ошибка регистрации" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('urechki_active_user');
  };

  // --- ИСТОРИЯ ЗАКАЗОВ ---
  const addOrderToHistory = (orderData) => {
    if (!user || !user.email) return;
    const ordersKey = `urechki_orders_${user.email}`;
    const existingOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    localStorage.setItem(ordersKey, JSON.stringify([orderData, ...existingOrders]));
  };

  const getUserOrders = () => {
    if (!user || !user.email) return [];
    return JSON.parse(localStorage.getItem(`urechki_orders_${user.email}`) || '[]');
  };

  // --- ПРОМОКОДЫ ---
  const addPromoToUser = (promo) => {
    if (!user || !user.email) return;
    const promosKey = `urechki_promos_${user.email}`;
    const existingPromos = JSON.parse(localStorage.getItem(promosKey) || '[]');
    localStorage.setItem(promosKey, JSON.stringify([promo, ...existingPromos]));
  };

  const getUserPromos = () => {
    if (!user || !user.email) return [];
    return JSON.parse(localStorage.getItem(`urechki_promos_${user.email}`) || '[]');
  };

  const removePromoFromUser = (promoCode) => {
    if (!user || !user.email) return;
    const promosKey = `urechki_promos_${user.email}`;
    const existingPromos = JSON.parse(localStorage.getItem(promosKey) || '[]');
    const updatedPromos = existingPromos.filter(p => p.promoCode !== promoCode);
    localStorage.setItem(promosKey, JSON.stringify(updatedPromos));
  };

  // --- ИЗБРАННОЕ (WISHLIST) ---
  const toggleWishlist = (product) => {
    if (!user || !user.email) return;
    const wishKey = `urechki_wishlist_${user.email}`;
    let wishlist = JSON.parse(localStorage.getItem(wishKey) || '[]');
    
    const exists = wishlist.find(p => p.id === product.id);
    if (exists) {
      wishlist = wishlist.filter(p => p.id !== product.id);
    } else {
      wishlist.push(product);
    }
    localStorage.setItem(wishKey, JSON.stringify(wishlist));
  };

  const getWishlist = () => {
    if (!user || !user.email) return [];
    return JSON.parse(localStorage.getItem(`urechki_wishlist_${user.email}`) || '[]');
  };

  const isInWishlist = (productId) => {
    const wishlist = getWishlist();
    return wishlist.some(p => p.id === productId);
  };

  // Бонусный баланс
  const getUserBonusBalance = () => {
    const orders = getUserOrders();
    let balance = 0;
    orders.forEach(order => {
      const earned = order.bonusesEarned !== undefined ? order.bonusesEarned : (order.total * 0.1);
      const spent = order.bonusesSpent || 0;
      balance += earned - spent;
    });
    return Math.max(0, balance);
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, register, logout, 
      addOrderToHistory, getUserOrders, 
      addPromoToUser, getUserPromos, removePromoFromUser, 
      toggleWishlist, getWishlist, isInWishlist,
      getUserBonusBalance 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
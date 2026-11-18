import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';
import { promoDiscountFor } from '../config';

const STORAGE_KEY = 'urechki_mobile_cart';
const CartContext = createContext(null);

const normalizeItems = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && item.productId != null)
    .map((item) => ({
      productId: Number(item.productId),
      name: String(item.name || 'Товар'),
      price: Number(item.price) || 0,
      quantity: Math.max(1, Number(item.quantity) || 1),
      category: item.category || '',
      emoji: item.emoji || '🍺',
    }));
};

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [bonusSpent, setBonusSpent] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (active) {
            setItems(normalizeItems(saved.items));
            setPromoCode(saved.promoCode || '');
            setBonusSpent(Number(saved.bonusSpent) || 0);
          }
        }
      } catch {
        // Корзину всегда можно собрать заново.
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  const persist = useCallback(async (nextItems, nextPromo, nextBonus) => {
    setItems(nextItems);
    setPromoCode(nextPromo);
    setBonusSpent(nextBonus);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        items: nextItems,
        promoCode: nextPromo,
        bonusSpent: nextBonus,
      }));
    } catch {
      // Сохранение опционально.
    }
  }, []);

  const add = useCallback((product, quantity = 1) => {
    const line = {
      productId: Number(product.id),
      name: product.name || 'Товар',
      price: Number(product.price) || 0,
      category: product.category || '',
      emoji: product.emoji || '🍺',
    };
    const existing = items.find((item) => item.productId === line.productId);
    const next = existing
      ? items.map((item) => item.productId === line.productId
        ? { ...item, quantity: item.quantity + quantity }
        : item)
      : [...items, { ...line, quantity }];
    persist(next, promoCode, bonusSpent);
    api.trackEvent({ type: 'add_to_cart', productId: line.productId, amount: line.price });
  }, [items, persist, promoCode, bonusSpent]);

  const updateQuantity = useCallback((productId, quantity) => {
    const next = quantity <= 0
      ? items.filter((item) => item.productId !== Number(productId))
      : items.map((item) => item.productId === Number(productId) ? { ...item, quantity } : item);
    persist(next, promoCode, bonusSpent);
  }, [items, persist, promoCode, bonusSpent]);

  const remove = useCallback((productId) => {
    persist(items.filter((item) => item.productId !== Number(productId)), promoCode, bonusSpent);
  }, [items, persist, promoCode, bonusSpent]);

  const clear = useCallback(() => persist([], '', 0), [persist]);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const baseTotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const estimatedTotal = useMemo(() => {
    const afterPromo = Math.max(0, baseTotal - promoDiscountFor(promoCode, baseTotal));
    return Math.max(0, afterPromo - Math.min(Math.max(0, bonusSpent), afterPromo));
  }, [baseTotal, bonusSpent, promoCode]);

  const value = useMemo(() => ({
    items,
    ready,
    count,
    baseTotal,
    estimatedTotal,
    promoCode,
    bonusSpent,
    add,
    updateQuantity,
    remove,
    clear,
    setPromoCode: (value) => persist(items, value, bonusSpent),
    setBonusSpent: (value) => persist(items, promoCode, Math.max(0, Number(value) || 0)),
  }), [items, ready, count, baseTotal, estimatedTotal, promoCode, bonusSpent, add, updateQuantity, remove, clear, persist]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart должен использоваться внутри CartProvider');
  return context;
}

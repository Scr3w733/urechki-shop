import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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

  // Синхронные копии состояния нужны, чтобы несколько подряд идущих вызовов
  // remove/removeMany в одном тике не перетирали друг друга старым массивом.
  const itemsRef = useRef([]);
  const promoRef = useRef('');
  const bonusRef = useRef(0);

  useEffect(() => {
    itemsRef.current = items;
    promoRef.current = promoCode;
    bonusRef.current = bonusSpent;
  }, [items, promoCode, bonusSpent]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (active) {
            const restoredItems = normalizeItems(saved.items);
            const restoredPromo = saved.promoCode || '';
            const restoredBonus = Number(saved.bonusSpent) || 0;
            itemsRef.current = restoredItems;
            promoRef.current = restoredPromo;
            bonusRef.current = restoredBonus;
            setItems(restoredItems);
            setPromoCode(restoredPromo);
            setBonusSpent(restoredBonus);
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
    itemsRef.current = nextItems;
    promoRef.current = nextPromo;
    bonusRef.current = nextBonus;
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
    const current = itemsRef.current;
    const existing = current.find((item) => item.productId === line.productId);
    const next = existing
      ? current.map((item) => item.productId === line.productId
        ? { ...item, quantity: item.quantity + quantity }
        : item)
      : [...current, { ...line, quantity }];
    persist(next, promoRef.current, bonusRef.current);
    api.trackEvent({ type: 'add_to_cart', productId: line.productId, amount: line.price });
  }, [persist]);

  const updateQuantity = useCallback((productId, quantity) => {
    const current = itemsRef.current;
    const id = Number(productId);
    const next = quantity <= 0
      ? current.filter((item) => item.productId !== id)
      : current.map((item) => item.productId === id ? { ...item, quantity } : item);
    persist(next, promoRef.current, bonusRef.current);
  }, [persist]);

  const remove = useCallback((productId) => {
    const id = Number(productId);
    return persist(
      itemsRef.current.filter((item) => item.productId !== id),
      promoRef.current,
      bonusRef.current,
    );
  }, [persist]);

  // Удаляет несколько позиций за одно обновление: checkout вызывает его после
  // оформления, когда часть заказов прошла, а часть — нет.
  const removeMany = useCallback((productIds) => {
    const ids = new Set(productIds.map(Number));
    return persist(
      itemsRef.current.filter((item) => !ids.has(Number(item.productId))),
      promoRef.current,
      bonusRef.current,
    );
  }, [persist]);

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
    removeMany,
    clear,
    setPromoCode: (value) => persist(itemsRef.current, value, bonusRef.current),
    setBonusSpent: (value) => persist(itemsRef.current, promoRef.current, Math.max(0, Number(value) || 0)),
  }), [items, ready, count, baseTotal, estimatedTotal, promoCode, bonusSpent, add, updateQuantity, remove, removeMany, clear, persist]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart должен использоваться внутри CartProvider');
  return context;
}

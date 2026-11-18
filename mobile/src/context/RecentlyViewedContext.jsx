import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'urechki_mobile_recently_viewed';
const MAX_ITEMS = 20;
const RecentlyViewedContext = createContext(null);

const normalize = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && item.id != null)
    .slice(0, MAX_ITEMS)
    .map((item) => ({
      id: item.id,
      name: String(item.name || 'Товар'),
      price: Number(item.price) || 0,
      category: String(item.category || ''),
      stockQuantity: Number(item.stockQuantity) || 0,
    }));
};

export function RecentlyViewedProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && raw) setItems(normalize(JSON.parse(raw)));
      } catch {
        // История просмотров — необязательная фича, битый кеш просто игнорируем.
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  const persist = useCallback((next) => {
    const limited = normalize(next);
    setItems(limited);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limited)).catch(() => {});
  }, []);

  const add = useCallback((product) => {
    if (!product?.id) return;
    const snapshot = {
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      stockQuantity: product.stockQuantity,
    };
    setItems((previous) => {
      const withoutDuplicate = previous.filter((item) => String(item.id) !== String(product.id));
      const next = [snapshot, ...withoutDuplicate].slice(0, MAX_ITEMS);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const remove = useCallback((id) => {
    persist(items.filter((item) => String(item.id) !== String(id)));
  }, [items, persist]);

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo(() => ({ items, ready, add, remove, clear }), [items, ready, add, remove, clear]);

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed должен использоваться внутри RecentlyViewedProvider');
  }
  return context;
}

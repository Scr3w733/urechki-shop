import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const CartContext = createContext();
const STORAGE_KEY = 'urechki_cart_v1';

const loadCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [flyToCart, setFlyToCart] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const addToCart = useCallback((product, quantity = 1) => {
    if ((product.stockQuantity ?? 1) <= 0) {
      showToast('Товара нет в наличии');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + quantity, product.stockQuantity ?? 999) }
          : item);
      }
      return [...prev, { ...product, quantity }];
    });
    setFlyToCart(true);
    window.setTimeout(() => setFlyToCart(false), 800);
    showToast(`«${product.name}» добавлен в корзину`);
  }, [showToast]);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      const max = item.stockQuantity ?? 999;
      const next = Math.max(1, Math.min(max, item.quantity + delta));
      return { ...item, quantity: next };
    }));
  }, []);

  const setQuantity = useCallback((id, quantity) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      const max = item.stockQuantity ?? 999;
      return { ...item, quantity: Math.max(1, Math.min(max, Number(quantity) || 1)) };
    }));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);
  const getTotal = useCallback(() => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [cart]);
  const getCount = useCallback(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, setQuantity, clearCart,
      getTotal, getCount, isCartOpen, setIsCartOpen, openCart, closeCart, flyToCart,
    }}>
      {children}

      <AnimatePresence>
        {flyToCart && (
          <motion.div
            initial={{ scale: 0, x: '50vw', y: '50vh', opacity: 1 }}
            animate={{ scale: 1, x: '95vw', y: '20px', opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{ position: 'fixed', top: 0, left: 0, width: '18px', height: '18px', background: 'var(--accent)', borderRadius: '50%', zIndex: 99999, pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: 84, left: '50%', transform: 'translateX(-50%)', background: 'rgba(20,20,24,.96)', border: '1px solid var(--accent)', color: '#fff', padding: '12px 22px', borderRadius: 12, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow)', maxWidth: '90vw' }}
          >
            <CheckCircle color="var(--accent)" size={19} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

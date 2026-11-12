import { createContext, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [flyToCart, setFlyToCart] = useState(false); // Состояние для анимации

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // Запускаем анимацию полета
    setFlyToCart(true);
    setTimeout(() => setFlyToCart(false), 800);

    showToast(`"${product.name}" добавлен в корзину!`);
  };

  // ... остальные функции (removeFromCart, updateQuantity, clearCart, getTotal)
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };
  const clearCart = () => setCart([]);
  const getTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, isCartOpen, setIsCartOpen, flyToCart }}>
      {children}
      
      {/* Анимация летящего шарика в корзину */}
      <AnimatePresence>
        {flyToCart && (
          <motion.div
            initial={{ scale: 0, x: '50vw', y: '50vh', opacity: 1 }}
            animate={{ scale: 1, x: '95vw', y: '20px', opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{ position: 'fixed', top: 0, left: 0, width: '20px', height: '20px', background: 'var(--accent)', borderRadius: '50%', zIndex: 99999, pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Всплывающее уведомление */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }} style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', background: '#1e1e1e', border: '1px solid var(--accent)', color: '#fff', padding: '15px 30px', borderRadius: '10px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 5px 20px rgba(212,175,55,0.3)' }}>
            <CheckCircle color="var(--accent)" size={20} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
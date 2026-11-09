import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom'; // <-- Добавили Link

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  
  const total = getTotal();
  const delivery = total > 0 && total < 2000 ? 300 : 0;
  const finalTotal = total + delivery;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 2000, backdropFilter: 'blur(5px)' }} />
          
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '400px', height: '100vh', background: '#0a0a0a', zIndex: 2001, padding: '30px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #d4af37' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#d4af37', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={28} /> Корзина
              </h2>
              <X onClick={() => setIsCartOpen(false)} style={{ cursor: 'pointer', color: '#fff' }} size={28} />
            </div>

            {cart.length > 0 && (
              <button onClick={clearCart} style={{ background: 'transparent', border: 'none', color: '#ff4444', textAlign: 'left', marginBottom: '15px', cursor: 'pointer', fontSize: '0.9rem' }}>Очистить корзину</button>
            )}

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
              {cart.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#555' }}>
                  <ShoppingBag size={80} style={{ marginBottom: '20px', opacity: 0.5 }} />
                  <p>Ваша корзина пуста.</p>
                </div>
              ) : (
                cart.map(item => (
                  <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', padding: '15px 0' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#fff', fontSize: '1rem' }}>{item.name}</h4>
                      <p style={{ color: '#d4af37', fontSize: '0.9rem', fontWeight: 'bold' }}>{item.price} ₽</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#1a1a1a', borderRadius: '5px', border: '1px solid #333' }}>
                        <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '5px 10px', cursor: 'pointer' }}><Minus size={14}/></button>
                        <span style={{ color: '#fff', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '5px 10px', cursor: 'pointer' }}><Plus size={14}/></button>
                      </div>
                      <Trash2 size={18} color="#ff4444" style={{ cursor: 'pointer' }} onClick={() => removeFromCart(item.id)} />
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '2px solid #333', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', marginBottom: '10px' }}>
                  <span>Товары:</span><span>{total} ₽</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', marginBottom: '20px' }}>
                  <span>Доставка:</span><span>{delivery === 0 ? 'Бесплатно' : `${delivery} ₽`}</span>
                </div>
                <h3 style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '1.5rem', marginBottom: '20px' }}>
                  <span>Итого:</span><span style={{ color: '#d4af37' }}>{finalTotal} ₽</span>
                </h3>
                <Link to="/checkout" onClick={() => setIsCartOpen(false)} style={{ textDecoration: 'none' }}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width: '100%', padding: '18px', background: '#d4af37', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer' }}>
                    ПЕРЕЙТИ К ОПЛАТЕ
                  </motion.button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
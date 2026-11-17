import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, productImage } from '../utils/product';

const FREE_DELIVERY = 2000;

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, setQuantity, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const total = getTotal();
  const delivery = total > 0 && total < FREE_DELIVERY ? 300 : 0;
  const remaining = Math.max(0, FREE_DELIVERY - total);
  const progress = Math.min((total / FREE_DELIVERY) * 100, 100);

  const goCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} />
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            <div className="drawer-header">
              <h2><ShoppingBag size={24} /> Корзина <span className="badge badge-accent">{cart.length}</span></h2>
              <button className="icon-btn" onClick={() => setIsCartOpen(false)} aria-label="Закрыть корзину"><X size={20} /></button>
            </div>

            {cart.length > 0 && (
              <div className="delivery-progress">
                <div className="flex between small">
                  <span className="flex gap-1"><Truck size={15} className="text-accent" /> Бесплатная доставка</span>
                  <strong className="text-accent">{remaining > 0 ? `ещё ${formatPrice(remaining)}` : 'получена!'}</strong>
                </div>
                <div className="progress-track"><motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${progress}%` }} /></div>
              </div>
            )}

            <div className="drawer-body">
              {cart.length === 0 ? (
                <div className="empty-state">
                  <ShoppingBag size={56} />
                  <h3 style={{ margin: '14px 0 8px' }}>Корзина пуста</h3>
                  <p>Самое время выбрать что-нибудь с характером.</p>
                  <Link to="/catalog" className="btn btn-primary" onClick={() => setIsCartOpen(false)} style={{ marginTop: 20 }}>В каталог</Link>
                </div>
              ) : (
                <>
                  <div className="flex between" style={{ marginBottom: 8 }}>
                    <span className="small muted">Товаров: {cart.reduce((s, i) => s + i.quantity, 0)}</span>
                    <button className="text-button danger" onClick={clearCart}>Очистить</button>
                  </div>
                  {cart.map(item => (
                    <motion.div key={item.id} className="cart-line" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
                      <div className="cart-line-media" style={{ overflow: 'hidden', padding: 0 }}>
                        <img src={productImage(item)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div className="cart-line-info">
                        <Link to={`/product/${item.id}`} onClick={() => setIsCartOpen(false)} className="product-title">{item.name}</Link>
                        <span className="text-accent bold small">{formatPrice(item.price)}</span>
                        <div className="qty">
                          <button onClick={() => updateQuantity(item.id, -1)} aria-label="Уменьшить"><Minus size={14} /></button>
                          <input
                            value={item.quantity}
                            onChange={e => setQuantity(item.id, e.target.value)}
                            aria-label="Количество"
                          />
                          <button onClick={() => updateQuantity(item.id, 1)} aria-label="Увеличить"><Plus size={14} /></button>
                        </div>
                      </div>
                      <button className="icon-btn" onClick={() => removeFromCart(item.id)} title="Удалить" aria-label="Удалить товар"><Trash2 size={16} color="var(--danger)" /></button>
                    </motion.div>
                  ))}
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="drawer-footer">
                <div className="flex between"><span className="muted">Товары</span><span>{formatPrice(total)}</span></div>
                <div className="flex between"><span className="muted">Доставка</span><span>{delivery ? formatPrice(delivery) : 'Бесплатно'}</span></div>
                <div className="divider" style={{ margin: '12px 0' }} />
                <div className="flex between"><strong>Итого</strong><strong className="price">{formatPrice(total + delivery)}</strong></div>
                <button className="btn btn-primary btn-lg btn-block" onClick={goCheckout} style={{ marginTop: 18 }}>
                  Оформить заказ <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

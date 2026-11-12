import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function QuickView({ product, onClose }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();

  if (!product) return null;

  const sticker = product.category === 'Пиво' ? '🍻' : product.category === 'Закуски' ? '🍟' : '👕';

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6000, backdropFilter: 'blur(10px)' }} onClick={onClose}>
        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} onClick={e => e.stopPropagation()} className="glass-panel" style={{ width: '90%', maxWidth: '800px', display: 'flex', flexWrap: 'wrap', overflow: 'hidden', position: 'relative' }}>
          
          <X onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer', color: '#d4af37', zIndex: 10 }} size={28} />
          
          <div style={{ flex: 1, minWidth: '300px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10rem', padding: '40px' }}>
            {sticker}
          </div>
          
          <div style={{ flex: 1, minWidth: '300px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ color: '#d4af37', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '10px' }}>{product.category}</p>
            <h2 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '15px', lineHeight: '1.1' }}>{product.name}</h2>
            <p style={{ color: '#aaa', fontSize: '1rem', lineHeight: '1.6', marginBottom: '20px' }}>{product.description}</p>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#d4af37', marginBottom: '30px' }}>{product.price} ₽</div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => { addToCart(product); onClose(); }} style={{ flex: 1, padding: '15px', background: '#d4af37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <ShoppingBag size={20} /> В КОРЗИНУ
              </motion.button>
              <button onClick={() => toggleWishlist(product)} style={{ padding: '15px', background: 'transparent', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer' }}>
                <Heart size={20} fill={isInWishlist(product.id) ? '#ff4444' : 'transparent'} color={isInWishlist(product.id) ? '#ff4444' : '#fff'} />
              </button>
            </div>
            
            <Link to={`/product/${product.id}`} onClick={onClose} style={{ display: 'block', textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '0.9rem', textDecoration: 'underline' }}>Перейти на страницу товара</Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
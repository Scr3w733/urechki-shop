import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Beer, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { cart, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} style={{ position: 'sticky', top: 0, zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', background: 'rgba(13, 13, 13, 0.85)', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 900, color: '#d4af37' }}>
          <Beer size={32} /> У РЕЧУШКИ
        </Link>
        
        <div style={{ display: 'flex', gap: '25px', fontWeight: 700, alignItems: 'center', fontSize: '0.95rem' }}>
          <Link to="/" className="nav-link">Главная</Link>
          <Link to="/catalog" className="nav-link">Каталог</Link>
          <Link to="/about" className="nav-link">История</Link>
          <Link to="/production" className="nav-link">Производство</Link>
          <Link to="/reviews" className="nav-link">Отзывы</Link>
          <Link to="/contacts" className="nav-link">Контакты</Link>
          
          <div style={{ display: 'flex', gap: '15px', marginLeft: '20px', alignItems: 'center' }}>
            {/* Кнопка Профиля */}
            {user ? (
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#d4af37', background: 'rgba(212,175,55,0.1)', padding: '8px 15px', borderRadius: '20px', border: '1px solid #d4af37' }}>
                <User size={18} /> <span>{user.name}</span>
              </Link>
            ) : (
              <motion.button onClick={() => setIsAuthOpen(true)} whileHover={{ scale: 1.05 }} style={{ background: 'transparent', border: '1px solid #d4af37', color: '#d4af37', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <User size={18} /> Войти
              </motion.button>
            )}

            {/* Иконка Корзины */}
            <motion.div onClick={() => setIsCartOpen(true)} whileHover={{ scale: 1.1 }} style={{ cursor: 'pointer', color: '#d4af37', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff4444', color: '#fff', fontSize: '0.7rem', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
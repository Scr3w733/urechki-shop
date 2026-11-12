import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Beer, ShoppingCart, User, Menu, X, Search, Settings, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import SettingsModal from './SettingsModal';

export default function Navbar() {
  const { cart, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Состояния для умного поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    // Загружаем товары для поиска при старте
    fetch('http://localhost:8080/api/products')
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${searchQuery}`);
      setSearchQuery('');
      setSearchResults([]);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} style={{ position: 'sticky', top: 0, zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 3%', background: 'rgba(13, 13, 13, 0.95)', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(var(--accent-rgb), 0.2)' }}>
        
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent)' }}>
          <Beer size={28} /> У РЕЧУШКИ
        </Link>

        {/* УМНЫЙ ПОИСК */}
        <div style={{ position: 'relative', width: '200px' }} className="desktop-menu">
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#111', border: '1px solid #333', borderRadius: '20px', padding: '5px 15px' }}>
            <Search size={16} color="#888" />
            <input type="text" placeholder="Поиск..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', marginLeft: '10px', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
          </form>
          
          {/* ВЫПАДАЮЩИЕ ПОДСКАЗКИ */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ position: 'absolute', top: '45px', left: 0, width: '300px', background: '#151515', border: '1px solid #333', borderRadius: '10px', overflow: 'hidden', zIndex: 1000, boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
                {searchResults.map(p => (
                  <div key={p.id} onClick={() => { navigate(`/product/${p.id}`); setSearchQuery(''); setSearchResults([]); }} style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderBottom: '1px solid #222' }}>
                    <div style={{ fontSize: '1.5rem' }}>{p.category === 'Пиво' ? '🍻' : '🍟'}</div>
                    <div>
                      <div style={{ color: '#fff', fontSize: '0.9rem' }}>{p.name}</div>
                      <div style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>{p.price} ₽</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', fontWeight: 700, alignItems: 'center', fontSize: '0.85rem' }} className="desktop-menu">
          <Link to="/" className="nav-link">Главная</Link>
          <Link to="/catalog" className="nav-link">Каталог</Link>
          <Link to="/blog" className="nav-link">Блог</Link>
          <Link to="/faq" className="nav-link">FAQ</Link>
          <Link to="/roulette" className="nav-link" style={{ color: '#ff4444' }}>Рулетка</Link>
          <Link to="/app" className="nav-link" style={{ color: 'var(--accent)' }}>Приложение</Link>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {/* ВОЗВРАЩЕННАЯ ШЕСТЕРЕНКА НАСТРОЕК */}
            <motion.div onClick={() => setIsSettingsOpen(true)} whileHover={{ scale: 1.1, rotate: 90 }} style={{ cursor: 'pointer', color: 'var(--accent)', display: 'flex', alignItems: 'center', background: 'rgba(212,175,55,0.1)', padding: '8px', borderRadius: '50%' }}>
              <Settings size={22} />
            </motion.div>

            {user ? (
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent)', background: 'rgba(var(--accent-rgb), 0.1)', padding: '8px 15px', borderRadius: '20px', border: '1px solid var(--accent)' }}>
                <User size={18} /> <span className="hide-mobile">{user.name}</span>
              </Link>
            ) : (
              <motion.button onClick={() => setIsAuthOpen(true)} whileHover={{ scale: 1.05 }} style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <User size={18} /> <span className="hide-mobile">Войти</span>
              </motion.button>
            )}

            <motion.div onClick={() => setIsCartOpen(true)} whileHover={{ scale: 1.1 }} style={{ cursor: 'pointer', color: 'var(--accent)', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff4444', color: '#fff', fontSize: '0.7rem', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </motion.div>
            
            <div className="mobile-burger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ display: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </div>
        </div>
      </motion.nav>

      {/* МОБИЛЬНОЕ МЕНЮ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ background: '#0a0a0a', overflow: 'hidden', borderBottom: '1px solid var(--accent)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '20px', gap: '15px' }}>
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="nav-link">Главная</Link>
              <Link to="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="nav-link">Каталог</Link>
              <Link to="/app" onClick={() => setIsMobileMenuOpen(false)} className="nav-link">Приложение</Link>
              <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="nav-link">Блог</Link>
              <Link to="/roulette" onClick={() => setIsMobileMenuOpen(false)} className="nav-link">Рулетка</Link>
              <button onClick={() => { setIsMobileMenuOpen(false); setIsSettingsOpen(true); }} style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>Настройки</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <style>{`
        @media (max-width: 1024px) {
          .desktop-menu { display: none !important; }
          .mobile-burger { display: block !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
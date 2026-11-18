import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Beer, ShoppingCart, User, Menu, X, Search, Settings, Smartphone, ChevronDown, Gift, Heart, Truck, Server } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import SettingsModal from './SettingsModal';

const links = [
  { to: '/', label: 'Главная', end: true },
  { to: '/catalog', label: 'Каталог' },
  { to: '/about', label: 'О нас' },
  { to: '/production', label: 'Производство' },
  { to: '/blog', label: 'Блог' },
  { to: '/faq', label: 'FAQ' },
];

export default function Navbar() {
  const { getCount, openCart } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const isOwner = user?.role === 'Владелец';
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [focused, setFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
    setFocused(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const results = search.length > 1
    ? products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : [];

  const serviceLinks = [
    { to: '/loyalty', label: 'Бонусы', icon: Gift },
    { to: '/track', label: 'Отследить', icon: Truck },
    { to: '/favorites', label: 'Избранное', icon: Heart },
    { to: '/status', label: 'Статус', icon: Server },
    ...(isOwner ? [{ to: '/analytics', label: 'Аналитика', icon: BarChart3 }] : []),
  ];

  const submitSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/catalog?search=${encodeURIComponent(search.trim())}`);
    setSearch('');
    setFocused(false);
  };

  return (
    <>
      <header className="site-header">
        <div className="container nav-inner">
          <Link to="/" className="brand" aria-label="У Речушки — на главную">
            <span className="brand-mark"><Beer size={22} /></span>
            <span>У РЕЧУШКИ</span>
          </Link>

          <nav className="desktop-menu main-nav" aria-label="Основная навигация">
            {links.map(link => (
              <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {link.label}
              </NavLink>
            ))}
            {serviceLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Icon size={15} /> {label}
              </NavLink>
            ))}
          </nav>

          <form className="header-search desktop-menu" onSubmit={submitSearch} role="search">
            <Search size={17} />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 160)}
              placeholder="Найти пиво, закуски…"
              aria-label="Поиск по каталогу"
            />
            <kbd>/</kbd>
            <AnimatePresence>
              {focused && results.length > 0 && (
                <motion.div className="search-dropdown" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                  {results.map(p => (
                    <button key={p.id} type="button" onClick={() => { navigate(`/product/${p.id}`); setSearch(''); setFocused(false); }}>
                      <span style={{ fontSize: 22 }}>{p.category === 'Пиво' ? '🍻' : '🎁'}</span>
                      <span style={{ flex: 1, textAlign: 'left' }}>
                        <strong style={{ display: 'block', fontSize: '.85rem' }}>{p.name}</strong>
                        <small className="muted">{p.price} ₽</small>
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="nav-actions">
            <button className="icon-btn desktop-menu" onClick={() => setIsSettingsOpen(true)} title="Настройки" aria-label="Настройки">
              <Settings size={19} />
            </button>

            {user ? (
              <div className="account-wrap">
                <button className="account-button" onClick={() => setAccountOpen(v => !v)} aria-expanded={accountOpen}>
                  <span className="avatar">{(user.name || 'У').charAt(0).toUpperCase()}</span>
                  <span className="hide-mobile">{user.name || 'Профиль'}</span>
                  <ChevronDown size={14} />
                </button>
                <AnimatePresence>
                  {accountOpen && (
                    <motion.div className="account-menu" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                      <Link to="/profile"><User size={16} /> Мой профиль</Link>
                      <Link to="/favorites"><Heart size={16} /> Избранное</Link>
                      <Link to="/loyalty"><Gift size={16} /> Бонусы</Link>
                      <Link to="/track"><Truck size={16} /> Отследить заказ</Link>
                      {isOwner && <Link to="/analytics"><BarChart3 size={16} /> Аналитика</Link>}
                      <Link to="/status"><Server size={16} /> Состояние сервисов</Link>
                      {isAdmin && <Link to="/admin"><Settings size={16} /> Админка</Link>}
                      <Link to="/app"><Smartphone size={16} /> Приложение</Link>
                      <button onClick={() => { logout(); setAccountOpen(false); }}>Выйти</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button className="btn btn-outline btn-sm" onClick={() => setIsAuthOpen(true)}>
                <User size={17} /> <span className="hide-mobile">Войти</span>
              </button>
            )}

            <button className="icon-btn cart-button" onClick={openCart} title="Корзина" aria-label="Открыть корзину">
              <ShoppingCart size={20} />
              {getCount() > 0 && <span className="cart-count">{getCount()}</span>}
            </button>

            <button className="icon-btn mobile-burger" onClick={() => setMobileOpen(v => !v)} aria-label="Открыть меню">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="mobile-menu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="container stack" style={{ padding: '18px 0' }}>
              {[...links, ...serviceLinks, { to: '/roulette', label: 'Рулетка' }, { to: '/merch', label: 'Мерч' }, { to: '/app', label: 'Приложение' }, { to: '/reviews', label: 'Отзывы' }, { to: '/contacts', label: 'Контакты' }].map(link => (
                <Link key={link.to} to={link.to} className="nav-link">{link.label}</Link>
              ))}
              {isAdmin && <Link to="/admin" className="nav-link text-accent">Админка</Link>}
              <button className="btn btn-outline" onClick={() => { setMobileOpen(false); setIsSettingsOpen(true); }}><Settings size={17} /> Настройки</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}

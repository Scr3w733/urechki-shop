import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Beer, ShoppingCart, User, UserRound, Menu, X, Search, Settings, Smartphone,
  ChevronDown, Gift, Heart, Truck, Server, Home, LayoutGrid, Info, Factory, Newspaper,
  HelpCircle, MapPin, Shirt, MessageSquare,
} from 'lucide-react';
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
    if (!mobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

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

  const drawerGroups = [
    {
      title: 'Магазин',
      items: [
        { to: '/', label: 'Главная', icon: Home, end: true },
        { to: '/catalog', label: 'Каталог', icon: LayoutGrid },
        { to: '/favorites', label: 'Избранное', icon: Heart },
      ],
    },
    {
      title: 'О пиве',
      items: [
        { to: '/about', label: 'О нас', icon: Info },
        { to: '/production', label: 'Производство', icon: Factory },
        { to: '/reviews', label: 'Отзывы', icon: MessageSquare },
        { to: '/blog', label: 'Блог', icon: Newspaper },
      ],
    },
    {
      title: 'Акции и сервисы',
      items: [
        { to: '/roulette', label: 'Рулетка', icon: Gift },
        { to: '/merch', label: 'Мерч', icon: Shirt },
        { to: '/loyalty', label: 'Бонусы', icon: Gift },
        { to: '/track', label: 'Отследить', icon: Truck },
        { to: '/status', label: 'Статус', icon: Server },
        { to: '/app', label: 'Приложение', icon: Smartphone },
      ],
    },
    {
      title: 'Помощь',
      items: [
        { to: '/faq', label: 'Вопросы и ответы', icon: HelpCircle },
        { to: '/contacts', label: 'Контакты', icon: MapPin },
      ],
    },
    ...(isAdmin ? [{
      title: 'Управление',
      items: [{ to: '/admin', label: 'Админка', icon: Settings }],
    }] : []),
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
          <motion.div
            key="nav-backdrop"
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="nav-drawer"
              className="nav-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              aria-label="Меню разделов"
            >
              <div className="drawer-header">
                <h2><Beer size={22} /> Разделы</h2>
                <button className="icon-btn" onClick={() => setMobileOpen(false)} aria-label="Закрыть меню">
                  <X size={22} />
                </button>
              </div>

              <div className="drawer-body">
                <form
                  className="nav-drawer-search"
                  role="search"
                  onSubmit={(event) => { submitSearch(event); setMobileOpen(false); }}
                >
                  <Search size={17} />
                  <input
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Найти пиво, закуски…"
                    aria-label="Поиск по каталогу"
                  />
                </form>

                {drawerGroups.map(group => (
                  <div className="nav-drawer-group" key={group.title}>
                    <div className="nav-drawer-title">{group.title}</div>
                    {group.items.map(({ to, label, icon: Icon, end }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) => `nav-drawer-link ${isActive ? 'active' : ''}`}
                      >
                        <Icon size={18} /> {label}
                      </NavLink>
                    ))}
                  </div>
                ))}
              </div>

              <div className="drawer-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => { setMobileOpen(false); openCart(); }}
                >
                  <ShoppingCart size={18} /> Корзина
                  {getCount() > 0 && <span className="nav-drawer-badge">{getCount()}</span>}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setMobileOpen(false);
                    if (user) navigate('/profile');
                    else setIsAuthOpen(true);
                  }}
                >
                  <UserRound size={18} /> {user ? 'Мой профиль' : 'Войти'}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => { setMobileOpen(false); setIsSettingsOpen(true); }}
                >
                  <Settings size={18} /> Настройки
                </button>
              </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}

import { Heart, Home, LayoutGrid, ShoppingBag, UserRound } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const items = [
  { to: '/', label: 'Главная', icon: Home, end: true },
  { to: '/catalog', label: 'Каталог', icon: LayoutGrid },
  { to: '/favorites', label: 'Избранное', icon: Heart },
  { to: '/profile', label: 'Профиль', icon: UserRound },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { cart, openCart } = useCart();
  const count = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  if (location.pathname.startsWith('/checkout') || location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="Быстрая навигация">
      {items.slice(0, 2).map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}>
          <Icon size={21} strokeWidth={1.9} />
          <span>{label}</span>
        </NavLink>
      ))}

      <button type="button" className="mobile-bottom-item mobile-bottom-cart" onClick={openCart} aria-label={`Открыть корзину, товаров: ${count}`}>
        <span className="mobile-bottom-icon-wrap">
          <ShoppingBag size={21} strokeWidth={1.9} />
          {count > 0 && <span className="mobile-bottom-badge">{count > 99 ? '99+' : count}</span>}
        </span>
        <span>Корзина</span>
      </button>

      {items.slice(2).map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}>
          <Icon size={21} strokeWidth={1.9} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

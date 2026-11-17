import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Award,
  CheckCircle2,
  Gift,
  Heart,
  LogOut,
  Mail,
  Phone,
  Settings,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { formatPrice } from '../utils/product';

const tabs = [
  { id: 'overview', label: 'Обзор', icon: ShieldCheck },
  { id: 'orders', label: 'Заказы', icon: ShoppingBag },
  { id: 'wishlist', label: 'Избранное', icon: Heart },
  { id: 'bonuses', label: 'Бонусы', icon: Gift },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

const dateOptions = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };

const formatServerDate = (value) => {
  if (!value) return '';
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day, hours = 0, minutes = 0] = value;
    return new Date(year, month - 1, day, hours, minutes).toLocaleString('ru-RU', dateOptions);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('ru-RU', dateOptions);
};

const statusClass = (status) => {
  const value = (status || '').toLowerCase();
  if (value.includes('отмен')) return 'badge badge-danger';
  if (value.includes('оплач') || value.includes('доставл') || value.includes('выполн')) return 'badge badge-success';
  return 'badge badge-accent';
};

export default function Profile() {
  const {
    user,
    logout,
    refreshUser,
    updateProfile,
    getUserOrders,
    getUserBonusBalance,
    getUserPromos,
    getWishlist,
  } = useAuth();
  const { addNotification } = useNotification();

  const [activeTab, setActiveTab] = useState('overview');
  const [serverOrders, setServerOrders] = useState([]);
  const [productNames, setProductNames] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [canClaimBonus, setCanClaimBonus] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const [settings, setSettings] = useState({ name: '', phone: '', password: '' });
  const [settingsErrors, setSettingsErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return undefined;
    let cancelled = false;
    setIsLoading(true);
    setLoadError('');

    Promise.allSettled([
      axios.get(`/api/orders/customer/${user.id}`),
      axios.get('/api/products'),
    ]).then(([ordersResult, productsResult]) => {
      if (cancelled) return;

      if (ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value.data)) {
        setServerOrders(ordersResult.value.data);
      } else {
        setLoadError('Не удалось загрузить заказы с сервера. Показаны сохранённые локально.');
      }

      if (productsResult.status === 'fulfilled' && Array.isArray(productsResult.value.data)) {
        const names = {};
        productsResult.value.data.forEach((product) => { names[product.id] = product.name; });
        setProductNames(names);
      }

      setIsLoading(false);
    });

    refreshUser();
    return () => { cancelled = true; };
  }, [user?.id, refreshUser]);

  useEffect(() => {
    if (!user?.email) return;
    const lastClaim = localStorage.getItem(`urechki_daily_bonus_${user.email}`);
    setCanClaimBonus(lastClaim !== new Date().toDateString());
  }, [user?.email]);

  useEffect(() => {
    if (activeTab === 'settings' && user) {
      setSettings({ name: user.name || '', phone: user.phone || '', password: '' });
      setSettingsErrors({});
    }
  }, [activeTab, user]);

  const localOrders = useMemo(() => getUserOrders() || [], [getUserOrders]);
  const promos = getUserPromos() || [];
  const wishlist = getWishlist() || [];
  const bonusBalance = Math.max(0, Number(getUserBonusBalance()) || 0);

  const orders = useMemo(() => {
    const byId = new Map();
    localOrders.forEach((order) => {
      if (order?.id != null) byId.set(String(order.id), { ...order, source: 'local' });
    });
    serverOrders.forEach((order) => {
      if (order?.id != null) byId.set(String(order.id), { ...order, source: 'server' });
    });

    return [...byId.values()].map((order) => {
      const isServer = order.source === 'server';
      const rawDate = isServer ? order.createdAt : order.date;
      const sortValue = Array.isArray(rawDate)
        ? new Date(rawDate[0], rawDate[1] - 1, rawDate[2], rawDate[3] || 0, rawDate[4] || 0).getTime()
        : new Date(rawDate || 0).getTime();
      const productName = productNames[order.productId];

      return {
        id: order.id,
        title: isServer
          ? (productName ? `${productName}${order.quantity ? ` · ${order.quantity} шт.` : ''}` : `Товар #${order.productId}${order.quantity ? ` · ${order.quantity} шт.` : ''}`)
          : (order.items || `Заказ #${order.id}`),
        amount: Number(isServer ? order.finalPrice : (order.finalTotal ?? order.finalPrice)) || 0,
        status: order.status || 'Оплачен',
        method: isServer ? order.paymentMethod : order.method,
        dateText: isServer ? formatServerDate(rawDate) : (order.date || ''),
        transactionId: order.transactionId,
        sortValue: Number.isFinite(sortValue) ? sortValue : 0,
      };
    }).sort((a, b) => (b.sortValue - a.sortValue) || (Number(b.id) - Number(a.id)));
  }, [localOrders, serverOrders, productNames]);

  const totalSpent = orders
    .filter((order) => !String(order.status).toLowerCase().includes('отмен'))
    .reduce((sum, order) => sum + order.amount, 0);

  const claimDailyBonus = async () => {
    if (!canClaimBonus || isClaiming || !user?.id) return;
    setIsClaiming(true);
    try {
      await axios.post(`/api/customers/${user.id}/bonuses`, { delta: 50 });
      localStorage.setItem(`urechki_daily_bonus_${user.email}`, new Date().toDateString());
      setCanClaimBonus(false);
      await refreshUser();
      addNotification('Вы получили 50 бонусных рублей!', 'success');
    } catch (error) {
      addNotification(error.response?.data?.message || 'Не удалось начислить бонус', 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  const setSettingsField = (key) => (event) => {
    setSettings((prev) => ({ ...prev, [key]: event.target.value }));
    setSettingsErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (settings.name.trim().length < 2) nextErrors.name = 'Укажите имя (минимум 2 символа)';
    if (settings.phone.trim() && settings.phone.replace(/\D/g, '').length < 10) {
      nextErrors.phone = 'Введите корректный номер телефона';
    }
    if (settings.password && settings.password.length < 4) {
      nextErrors.password = 'Пароль должен быть не короче 4 символов';
    }
    setSettingsErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !user?.id) return;

    const payload = { name: settings.name.trim(), phone: settings.phone.trim() };
    if (settings.password) payload.password = settings.password;

    setIsSaving(true);
    try {
      const result = await updateProfile(payload);
      if (result.success) {
        setSettings((prev) => ({ ...prev, password: '' }));
        addNotification('Профиль успешно сохранён', 'success');
      } else {
        addNotification(result.message || 'Не удалось сохранить профиль', 'error');
      }
    } catch {
      addNotification('Ошибка соединения с сервером', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container section">
        <EmptyState
          title="Войдите в аккаунт"
          description="Личный кабинет доступен после входа."
          action={<Link to="/" className="btn btn-primary btn-lg">На главную</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="flex between wrap gap-2" style={{ marginBottom: 28 }}>
        <div>
          <span className="eyebrow">Личный кабинет</span>
          <h2>Профиль</h2>
        </div>
        <button type="button" className="btn btn-danger btn-sm" onClick={logout}>
          <LogOut size={17} /> Выйти
        </button>
      </div>

      <div className="tabs" role="tablist" aria-label="Разделы профиля">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            className={`tab ${activeTab === id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <span className="flex gap-2" style={{ gap: 8 }}>
              <Icon size={16} /> {label}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-3">
              <div className="card stack">
                <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.7rem' }}>
                  {(user.name || 'У')[0].toUpperCase()}
                </div>
                <div>
                  <h3>{user.name}</h3>
                  <p className="small muted flex gap-2"><Mail size={15} /> {user.email}</p>
                  {user.phone && <p className="small muted flex gap-2"><Phone size={15} /> {user.phone}</p>}
                </div>
                <span className={`badge ${user.role === 'Клиент' ? '' : 'badge-accent'}`} style={{ alignSelf: 'flex-start' }}>
                  {user.role || 'Клиент'}
                </span>
              </div>

              <div className="card stack">
                <div className="flex gap-2"><Award className="text-accent" size={22} /><h3>Бонусы</h3></div>
                <div className="text-accent bold" style={{ fontSize: '2.2rem' }}>{formatPrice(bonusBalance)}</div>
                <p className="small muted">Бонусами можно оплатить до 50% заказа.</p>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setActiveTab('bonuses')}>
                  Подробнее
                </button>
              </div>

              <div className="card stack">
                <div className="flex gap-2"><ShoppingBag className="text-accent" size={22} /><h3>Покупки</h3></div>
                <div className="bold" style={{ fontSize: '2.2rem' }}>{orders.length}</div>
                <p className="small muted">Сумма заказов: {formatPrice(totalSpent)}</p>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setActiveTab('orders')}>
                  Мои заказы
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="stack">
              {loadError && <div className="card"><span className="form-error">{loadError}</span></div>}
              {isLoading && (
                <div className="card flex gap-2 center">
                  <span className="spinner" /> <span className="muted small">Загружаем заказы…</span>
                </div>
              )}
              {!isLoading && orders.length === 0 && (
                <EmptyState
                  title="Заказов пока нет"
                  description="Здесь появится история ваших покупок."
                  action={<Link to="/catalog" className="btn btn-primary">В каталог</Link>}
                />
              )}
              {orders.map((order) => (
                <div className="card" key={order.id} style={{ borderLeft: '3px solid var(--accent)' }}>
                  <div className="flex between wrap gap-2">
                    <div className="stack gap-2">
                      <div className="flex wrap gap-2">
                        <h3 className="small bold" style={{ fontFamily: 'inherit' }}>Заказ #{order.id}</h3>
                        <span className={statusClass(order.status)}>{order.status}</span>
                      </div>
                      <span className="bold">{order.title}</span>
                      <span className="dim tiny">{order.dateText}{order.method ? ` · ${order.method}` : ''}</span>
                    </div>
                    <div className="text-accent bold" style={{ fontSize: '1.3rem' }}>{formatPrice(order.amount)}</div>
                  </div>
                  {order.transactionId && <div className="dim tiny" style={{ marginTop: 8 }}>Транзакция: {order.transactionId}</div>}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'wishlist' && (
            wishlist.length === 0 ? (
              <EmptyState
                title="В избранном пусто"
                description="Нажмите на сердечко у понравившегося товара, чтобы сохранить его здесь."
                action={<Link to="/catalog" className="btn btn-primary">Выбрать пиво</Link>}
              />
            ) : (
              <div className="grid grid-3">
                {wishlist.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            )
          )}

          {activeTab === 'bonuses' && (
            <div className="grid grid-2">
              <div className="card stack">
                <div className="flex gap-2"><Award className="text-accent" size={22} /><h3>Бонусный счёт</h3></div>
                <div className="text-accent bold" style={{ fontSize: '3rem' }}>{formatPrice(bonusBalance)}</div>
                <p className="small muted">
                  Ежедневно заходите за бонусом и оплачивайте до 50% стоимости заказа.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={claimDailyBonus}
                  disabled={!canClaimBonus || isClaiming}
                >
                  {isClaiming ? <><span className="spinner" /> Начисляем…</> : canClaimBonus ? (
                    <><Gift size={17} /> Забрать ежедневный бонус (+50 ₽)</>
                  ) : (
                    <><CheckCircle2 size={17} /> Бонус уже получен сегодня</>
                  )}
                </button>
              </div>

              <div className="card stack">
                <div className="flex gap-2"><Gift className="text-accent" size={22} /><h3>Мои промокоды</h3></div>
                {promos.length === 0 ? (
                  <p className="small muted">Промокодов пока нет. Участвуйте в акциях, чтобы получить скидку.</p>
                ) : (
                  <div className="flex wrap gap-2">
                    {promos.map((promo, index) => (
                      <div className="badge badge-accent" key={`${promo.promoCode}-${index}`}>
                        {promo.prize} · <span className="bold">{promo.promoCode}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="dim tiny">Промокод применяется на шаге оплаты оформления заказа.</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="card" style={{ maxWidth: 560 }}>
              <div className="flex gap-2" style={{ marginBottom: 20 }}>
                <Settings className="text-accent" size={22} />
                <h3>Данные профиля</h3>
              </div>
              <form className="stack" onSubmit={saveSettings} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-name">Имя</label>
                  <input
                    id="profile-name"
                    className="input"
                    type="text"
                    value={settings.name}
                    onChange={setSettingsField('name')}
                    aria-invalid={Boolean(settingsErrors.name)}
                  />
                  {settingsErrors.name && <span className="form-error" role="alert">{settingsErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-phone">Телефон</label>
                  <input
                    id="profile-phone"
                    className="input"
                    type="tel"
                    placeholder="+7 (999) 123-45-67"
                    value={settings.phone}
                    onChange={setSettingsField('phone')}
                    aria-invalid={Boolean(settingsErrors.phone)}
                  />
                  {settingsErrors.phone && <span className="form-error" role="alert">{settingsErrors.phone}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-email">Email</label>
                  <input id="profile-email" className="input" type="email" value={user.email} disabled />
                  <span className="dim tiny">Email и роль изменить нельзя.</span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-password">Новый пароль</label>
                  <input
                    id="profile-password"
                    className="input"
                    type="password"
                    placeholder="Оставьте пустым, чтобы не менять"
                    value={settings.password}
                    onChange={setSettingsField('password')}
                    aria-invalid={Boolean(settingsErrors.password)}
                  />
                  {settingsErrors.password && <span className="form-error" role="alert">{settingsErrors.password}</span>}
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ alignSelf: 'flex-start' }}>
                  {isSaving ? <><span className="spinner" /> Сохраняем…</> : 'Сохранить изменения'}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

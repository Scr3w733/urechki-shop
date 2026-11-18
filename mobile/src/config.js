/**
 * Единая конфигурация API мобильного приложения.
 *
 * Все запросы идут через nginx сайта (порт 80), поэтому для телефона в
 * локальной сети нужно указать IP компьютера с Docker:
 *   EXPO_PUBLIC_API_ORIGIN=http://192.168.1.10 npm start
 * По умолчанию используется localhost — этого достаточно для эмулятора iOS
 * и Expo Web.
 */
const clean = (value) => String(value || '').replace(/\/+$/, '');

export const API_ORIGIN = clean(process.env.EXPO_PUBLIC_API_ORIGIN || 'http://localhost');

export const ENDPOINTS = {
  mobile: `${API_ORIGIN}/api/mobile`,
  catalog: `${API_ORIGIN}/api/products`,
  customers: `${API_ORIGIN}/api/customers`,
  orders: `${API_ORIGIN}/api/orders`,
  payments: `${API_ORIGIN}/api/payments`,
  loyalty: `${API_ORIGIN}/api/loyalty`,
  tracking: `${API_ORIGIN}/api/tracking`,
  favorites: `${API_ORIGIN}/api/favorites`,
  analytics: `${API_ORIGIN}/api/analytics`,
  notifications: `${API_ORIGIN}/api/notifications`,
};

/** Все health-проверки идут через nginx — так же, как и остальные запросы приложения. */
export const PLATFORM_SERVICES = [
  { id: 'catalog', name: 'Каталог', path: '/api/products/health', description: 'Товары, цены и остатки' },
  { id: 'crm', name: 'Клиенты', path: '/api/customers/health', description: 'Вход, роли и бонусы' },
  { id: 'orders', name: 'Заказы', path: '/api/orders/health', description: 'Оформление и история' },
  { id: 'payments', name: 'Оплата', path: '/api/payments/health', description: 'Платежи и возвраты' },
  { id: 'notifications', name: 'Уведомления', path: '/api/notifications/health', description: 'Письма клиентам' },
  { id: 'loyalty', name: 'Лояльность', path: '/api/loyalty/health', description: 'Уровни и кэшбэк' },
  { id: 'tracking', name: 'Доставка', path: '/api/tracking/health', description: 'Статусы отправлений' },
  { id: 'favorites', name: 'Избранное', path: '/api/favorites/health', description: 'Синхронизация с сайтом' },
  { id: 'analytics', name: 'Аналитика', path: '/api/analytics/health', description: 'События и воронка' },
  { id: 'mobile', name: 'Мобильный шлюз', path: '/api/mobile/health', description: 'API этого приложения' },
];

export const PROMO_CODES = ['URE4KA', 'BEER5', 'BEER10', 'BEER15', 'CASH500'];

// Ориентировочный расчёт для интерфейса. Итоговую сумму всегда подтверждает
// order-service — правила продублированы здесь только чтобы не удивлять
// покупателя цифрами в корзине и на экране оформления.
export function promoDiscountFor(code, amount) {
  const base = Math.max(0, Number(amount) || 0);
  switch (String(code || '').trim().toUpperCase()) {
    case 'URE4KA':
    case 'BEER5': return base * 0.05;
    case 'BEER10': return base * 0.10;
    case 'BEER15': return base * 0.15;
    case 'CASH500': return Math.min(base, 500);
    default: return 0;
  }
}

export const PROMO_DETAILS = {
  URE4KA: { title: 'Промокод сообщества', description: 'Скидка для своих — введите при оформлении заказа', badge: 'Хит' },
  BEER5: { title: 'Лёгкая скидка', description: 'Небольшая скидка на первый заказ в приложении', badge: '5%' },
  BEER10: { title: 'Пивная десятка', description: 'Скидка на заказ от двух позиций', badge: '10%' },
  BEER15: { title: 'Крафтовый уровень', description: 'Максимальная скидка на пиво и наборы', badge: '15%' },
  CASH500: { title: 'Скидка 500 ₽', description: 'Крупная скидка на большой заказ', badge: '500 ₽' },
};

export const APP_INFO = {
  name: 'У Речушки',
  tagline: 'Настоящий сибирский крафт с 2015 года',
  developer: 'Разработка сайта: Притчин Владимир, группа 9-прг401',
};

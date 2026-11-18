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
  loyalty: `${API_ORIGIN}/api/loyalty`,
  tracking: `${API_ORIGIN}/api/tracking`,
  favorites: `${API_ORIGIN}/api/favorites`,
  analytics: `${API_ORIGIN}/api/analytics`,
  notifications: `${API_ORIGIN}/api/notifications`,
};

export const PROMO_CODES = ['URE4KA', 'BEER5', 'BEER10', 'BEER15', 'CASH500'];

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

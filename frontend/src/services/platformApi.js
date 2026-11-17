import axios from 'axios';

// Единый клиент для новых платформенных сервисов (лояльность, доставка,
// избранное, аналитика, мобильный шлюз). Все ошибки возвращаются как Error
// с человекочитаемым сообщением на русском — без alert() и без «сырых» стеков.
const client = axios.create({ timeout: 12000 });

export const normalizeApiError = (error, fallback = 'Не удалось выполнить запрос') => {
  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim()) return data.trim();
  if (data && typeof data === 'object') {
    const message = data.message ?? data.error ?? data.detail ?? data.reason;
    if (typeof message === 'string' && message.trim()) return message.trim();
    if (Array.isArray(message) && message.length) return message.join('; ');
  }

  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return 'Сервис не ответил вовремя. Попробуйте ещё раз.';
  }
  if (!error?.response) {
    return 'Не удалось связаться с сервисом. Проверьте подключение и попробуйте снова.';
  }

  switch (error.response.status) {
    case 400: return 'Некорректный запрос. Проверьте введённые данные.';
    case 401: return 'Необходима авторизация. Войдите в аккаунт.';
    case 403: return 'Доступ к этим данным запрещён.';
    case 404: return 'Запрошенные данные не найдены.';
    case 409: return 'Конфликт данных. Обновите страницу и попробуйте снова.';
    case 422: return 'Не удалось обработать данные. Проверьте введённые значения.';
    case 429: return 'Слишком много запросов. Немного подождите и повторите попытку.';
    case 500:
    case 502:
    case 503:
    case 504: return 'Сервис временно недоступен. Попробуйте позже.';
    default: return fallback;
  }
};

const request = async (config, fallback) => {
  try {
    const response = await client.request(config);
    return response.data;
  } catch (error) {
    throw new Error(normalizeApiError(error, fallback));
  }
};

const get = (url, options = {}, fallback) => request({ method: 'GET', url, ...options }, fallback);
const post = (url, data, fallback) => request({ method: 'POST', url, data }, fallback);
const patch = (url, data, fallback) => request({ method: 'PATCH', url, data }, fallback);
const del = (url, fallback) => request({ method: 'DELETE', url }, fallback);

/* ------------------------------ Лояльность ------------------------------ */

export const getLoyaltyHealth = () => get('/api/loyalty/health');
export const getLoyaltyAccount = (customerId) => get(`/api/loyalty/accounts/${encodeURIComponent(customerId)}`);
export const quoteLoyalty = ({ customerId, amount }) => post('/api/loyalty/quote', { customerId, amount });
export const accrueLoyalty = ({ customerId, orderId, amount }) =>
  post('/api/loyalty/accrue', { customerId, orderId, amount });
export const getLoyaltyHistory = (customerId) => get(`/api/loyalty/history/${encodeURIComponent(customerId)}`);

/* ------------------------------- Доставка ------------------------------- */

export const getTrackingHealth = () => get('/api/tracking/health');
export const createShipment = ({ orderId, customerId, address }) =>
  post('/api/tracking/shipments', { orderId, customerId, address });
export const getShipment = (orderId) => get(`/api/tracking/shipments/${encodeURIComponent(orderId)}`);
export const updateShipmentStatus = (orderId, { status, note, location }) =>
  patch(`/api/tracking/shipments/${encodeURIComponent(orderId)}/status`, { status, note, location });
export const getCustomerShipments = (customerId) => get(`/api/tracking/customer/${encodeURIComponent(customerId)}`);

/* ------------------------------- Избранное ------------------------------ */

export const getFavoritesHealth = () => get('/api/favorites/health');
export const getFavorites = (customerId) => get(`/api/favorites/${encodeURIComponent(customerId)}`);
export const addFavorite = (customerId, productId) =>
  post(`/api/favorites/${encodeURIComponent(customerId)}`, { productId });
export const removeFavorite = (customerId, productId) =>
  del(`/api/favorites/${encodeURIComponent(customerId)}/${encodeURIComponent(productId)}`);
export const syncFavorites = (customerId, productIds) =>
  post(`/api/favorites/${encodeURIComponent(customerId)}/sync`, { productIds });

/* ------------------------------- Аналитика ------------------------------ */

export const getAnalyticsHealth = () => get('/api/analytics/health');
export const getAnalyticsSummary = () => get('/api/analytics/summary');
export const getAnalyticsFunnel = () => get('/api/analytics/funnel');
export const getAnalyticsRecent = (limit = 20) => get('/api/analytics/recent', { params: { limit } });
export const trackEvent = (payload) => post('/api/analytics/events', payload);

/* ----------------------------- Мобильный шлюз --------------------------- */

export const getMobileHealth = () => get('/api/mobile/health');
export const getMobileHome = () => get('/api/mobile/home');
export const getMobileCatalog = () => get('/api/mobile/catalog');
export const getMobileProfile = (id) => get(`/api/mobile/profile/${encodeURIComponent(id)}`);

/* --------------------- Каталог (для сопоставления товаров) -------------- */

export const getCatalogProducts = () => get('/api/products');

export default {
  normalizeApiError,
  getLoyaltyHealth, getLoyaltyAccount, quoteLoyalty, accrueLoyalty, getLoyaltyHistory,
  getTrackingHealth, createShipment, getShipment, updateShipmentStatus, getCustomerShipments,
  getFavoritesHealth, getFavorites, addFavorite, removeFavorite, syncFavorites,
  getAnalyticsHealth, getAnalyticsSummary, getAnalyticsFunnel, getAnalyticsRecent, trackEvent,
  getMobileHealth, getMobileHome, getMobileCatalog, getMobileProfile,
  getCatalogProducts,
};

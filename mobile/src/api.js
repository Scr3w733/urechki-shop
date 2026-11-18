import { ENDPOINTS } from './config';

/**
 * Тонкий HTTP-клиент: всегда JSON, понятные русские ошибки, таймаут и
 * отмена запроса. Никаких «сырых» стек-трейсов в интерфейсе.
 */
const request = async (url, { method = 'GET', body, timeout = 15000 } = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const raw = await response.text();
    let payload = null;
    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = raw;
      }
    }

    if (!response.ok) {
      const message = payload && typeof payload === 'object'
        ? payload.message ?? payload.error ?? payload.detail ?? payload.reason
        : payload;
      const text = typeof message === 'string' && message.trim()
        ? message.trim()
        : `Сервис вернул ошибку (${response.status})`;
      throw new Error(text);
    }

    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Сервис не ответил вовремя. Попробуйте ещё раз.');
    }
    if (error instanceof TypeError && !error.message) {
      throw new Error('Не удалось связаться с сервисом. Проверьте подключение.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

const query = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.append(key, String(value));
  });
  const string = search.toString();
  return string ? `?${string}` : '';
};

export const api = {
  health: () => request(`${ENDPOINTS.mobile}/health`),
  home: (customerId) => request(`${ENDPOINTS.mobile}/home${query({ customerId })}`),
  catalog: ({ category, search, limit } = {}) =>
    request(`${ENDPOINTS.mobile}/catalog${query({ category, search, limit })}`),
  product: (id) => request(`${ENDPOINTS.mobile}/product/${encodeURIComponent(id)}`),
  profile: (customerId) => request(`${ENDPOINTS.mobile}/profile/${encodeURIComponent(customerId)}`),
  orders: (customerId) => request(`${ENDPOINTS.mobile}/orders/${encodeURIComponent(customerId)}`),

  customers: () => request(ENDPOINTS.customers),
  login: (email, password) => request(`${ENDPOINTS.customers}/login`, { method: 'POST', body: { email, password } }),
  register: (data) => request(`${ENDPOINTS.customers}/register`, { method: 'POST', body: data }),
  updateCustomer: (id, data) => request(`${ENDPOINTS.customers}/${id}`, { method: 'PUT', body: data }),

  createOrder: (payload) => request(ENDPOINTS.orders, { method: 'POST', body: payload }),

  loyaltyAccount: (customerId) => request(`${ENDPOINTS.loyalty}/accounts/${encodeURIComponent(customerId)}`),
  loyaltyQuote: (customerId, amount) =>
    request(`${ENDPOINTS.loyalty}/quote`, { method: 'POST', body: { customerId, amount } }),

  shipment: (orderId) => request(`${ENDPOINTS.tracking}/shipments/${encodeURIComponent(orderId)}`),
  createShipment: (payload) => request(`${ENDPOINTS.tracking}/shipments`, { method: 'POST', body: payload }),

  favorites: (customerId) => request(`${ENDPOINTS.favorites}/${encodeURIComponent(customerId)}`),
  addFavorite: (customerId, productId) =>
    request(`${ENDPOINTS.favorites}/${encodeURIComponent(customerId)}`, { method: 'POST', body: { productId } }),
  removeFavorite: (customerId, productId) =>
    request(`${ENDPOINTS.favorites}/${encodeURIComponent(customerId)}/${encodeURIComponent(productId)}`, { method: 'DELETE' }),

  /** Аналитика — best effort: отсутствие сервиса не должно ломать экран. */
  trackEvent: async (payload) => {
    try {
      return await request(`${ENDPOINTS.analytics}/events`, { method: 'POST', body: payload, timeout: 5000 });
    } catch {
      return null;
    }
  },
  analyticsSummary: () => request(`${ENDPOINTS.analytics}/summary`),
  analyticsFunnel: () => request(`${ENDPOINTS.analytics}/funnel`),
  analyticsRecent: (limit = 20) => request(`${ENDPOINTS.analytics}/recent${query({ limit })}`),

  notifications: (email) => request(`${ENDPOINTS.notifications}${query({ email })}`),
};

export const asArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    for (const key of keys) {
      if (Array.isArray(payload[key])) return payload[key];
    }
  }
  return [];
};

export const normalizeError = (error, fallback = 'Не удалось выполнить запрос') =>
  error?.message || fallback;

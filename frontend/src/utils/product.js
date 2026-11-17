export const categoryEmoji = (category = '') => {
  const map = {
    'Пиво': '🍻',
    'Закуски': '🥨',
    'Мерч': '👕',
    'Наборы': '🎁',
    'Сертификаты': '🎟️',
  };
  return map[category] || '🍺';
};

const IMAGE_BASE = import.meta.env?.BASE_URL || '/';
const asset = (name) => `${IMAGE_BASE.replace(/\/?$/, '/')}images/${name}`;

// Локальные SVG-иллюстрации: работают офлайн, не зависят от генератора AI.
export const productImage = (product) => {
  const category = String(product?.category || '');
  const name = String(product?.name || '').toLowerCase();
  const description = String(product?.description || '').toLowerCase();
  const haystack = `${name} ${description}`;

  if (category === 'Закуски') return asset('snacks.svg');
  if (category === 'Мерч') return asset('merch.svg');
  if (category === 'Наборы' || category === 'Сертификаты') return asset('gift-set.svg');

  if (/dipa|ipa|хмел|горьк/.test(haystack)) return asset('beer-ipa.svg');
  if (/стаут|тёмн|темн|кофе|шоколад|портер|black|stout/.test(haystack)) return asset('beer-stout.svg');
  return asset('beer-lager.svg');
};

export const heroImage = () => asset('hero.svg');
export const appPreviewImage = () => asset('app-preview.svg');

export const categoryGradient = (category = '') => {
  const map = {
    'Пиво': 'linear-gradient(145deg, rgba(212,175,55,.22), rgba(120,60,15,.12))',
    'Закуски': 'linear-gradient(145deg, rgba(234,179,8,.18), rgba(146,64,14,.12))',
    'Мерч': 'linear-gradient(145deg, rgba(168,85,247,.18), rgba(30,64,175,.12))',
    'Наборы': 'linear-gradient(145deg, rgba(34,197,94,.16), rgba(212,175,55,.12))',
    'Сертификаты': 'linear-gradient(145deg, rgba(244,63,94,.16), rgba(212,175,55,.12))',
  };
  return map[category] || 'linear-gradient(145deg, rgba(212,175,55,.16), rgba(255,255,255,.03))';
};

// Стабильный «рейтинг» для витрины: данные реальных отзывов пока нет.
export const productRating = (product) => {
  const id = Number(product?.id) || 0;
  return (4.5 + (id % 5) * 0.1).toFixed(1);
};

export const productReviews = (product) => {
  const id = Number(product?.id) || 0;
  return 18 + ((id * 7) % 80);
};

export const formatPrice = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0 ₽';
  return `${number.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`;
};

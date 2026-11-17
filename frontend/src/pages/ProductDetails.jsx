import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  PackageX,
  RefreshCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import QuickView from '../components/QuickView';
import EmptyState from '../components/EmptyState';
import { LineSkeleton, ProductGridSkeleton } from '../components/Skeleton';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { categoryEmoji, categoryGradient, formatPrice, productRating, productReviews } from '../utils/product';

const DEMO_NAMES = ['Алексей', 'Мария', 'Дмитрий', 'Ольга', 'Сергей'];
const DEMO_TEXTS = [
  'Пиво всегда свежее, беру с удовольствием.',
  'Отличный вкус, друзьям тоже понравилось.',
  'Заказываю не в первый раз — качество стабильное.',
  'Быстрая доставка и аккуратная упаковка.',
  'Достойный крафт по хорошей цене.',
];

const readReviews = (id) => {
  try {
    const raw = localStorage.getItem(`urechki_reviews_${id}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, toggleWishlist, isInWishlist } = useAuth();
  const { addNotification } = useNotification();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [userReviews, setUserReviews] = useState(() => readReviews(id));
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });

  const demoReviews = (() => {
    const seed = Number(id) || 1;
    return Array.from({ length: 3 }, (_, index) => ({
      name: DEMO_NAMES[(seed + index) % DEMO_NAMES.length],
      text: DEMO_TEXTS[(seed + index * 2) % DEMO_TEXTS.length],
      rating: 5,
      date: `${10 + index} ноября 2026`,
    }));
  })();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError('');
    setNotFound(false);
    setProduct(null);
    setQuantity(1);

    axios.get(`/api/products/${id}`, { signal: controller.signal })
      .then((response) => { if (!cancelled) setProduct(response.data); })
      .catch((requestError) => {
        if (cancelled || axios.isCancel(requestError)) return;
        const status = requestError.response?.status;
        const message = requestError.response?.data?.message
          || (status === 404 ? 'Товар не найден' : 'Не удалось загрузить товар');
        setNotFound(status === 404);
        setError(message);
        if (status !== 404) addNotification(message, 'error');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; controller.abort(); };
  }, [id, addNotification]);

  useEffect(() => {
    if (!product?.category) return undefined;
    const controller = new AbortController();
    let cancelled = false;
    setRelatedLoading(true);
    axios.get('/api/products', { params: { category: product.category }, signal: controller.signal })
      .then((response) => {
        if (cancelled) return;
        const list = Array.isArray(response.data) ? response.data : [];
        setRelated(list.filter((item) => String(item.id) !== String(id)).slice(0, 4));
      })
      .catch((requestError) => {
        if (cancelled || axios.isCancel(requestError)) return;
        setRelated([]);
        const message = requestError.response?.data?.message || 'Не удалось загрузить похожие товары';
        addNotification(message, 'error');
      })
      .finally(() => { if (!cancelled) setRelatedLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [product?.category, id, addNotification]);

  useEffect(() => {
    setUserReviews(readReviews(id));
    setNewReview({ rating: 5, text: '' });
  }, [id]);

  if (loading) {
    return (
      <div className="container section-sm">
        <div className="grid grid-2 gap-3" style={{ alignItems: 'start' }}>
          <div className="skeleton" style={{ minHeight: 420, borderRadius: 20 }} />
          <div className="stack">
            <LineSkeleton width="35%" />
            <LineSkeleton width="75%" height={34} />
            <LineSkeleton width="45%" height={26} />
            <LineSkeleton width="100%" height={90} />
            <LineSkeleton width="70%" height={52} />
            <LineSkeleton width="100%" height={48} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section-sm">
        <EmptyState
          icon={<PackageX size={46} />}
          title={notFound ? 'Товар не найден' : 'Не удалось открыть товар'}
          description={error || 'Попробуйте вернуться в каталог и выбрать другой товар.'}
          action={<Link className="btn btn-primary" to="/catalog">Вернуться в каталог</Link>}
        />
      </div>
    );
  }

  const maxQuantity = product.stockQuantity ?? 0;
  const inStock = maxQuantity > 0;
  const favorite = isInWishlist(product.id);
  const reviews = [...userReviews, ...demoReviews];
  const sku = `UR-${String(product.id).padStart(5, '0')}`;

  const handleFavorite = () => {
    if (!user) {
      addNotification('Войдите, чтобы добавлять товары в избранное', 'info');
      return;
    }
    toggleWishlist(product);
    addNotification(favorite ? 'Удалено из избранного' : 'Добавлено в избранное', 'success');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addNotification('Ссылка на товар скопирована', 'success');
    } catch {
      addNotification('Не удалось скопировать ссылку', 'error');
    }
  };

  const handleSubmitReview = (event) => {
    event.preventDefault();
    if (!user) {
      addNotification('Войдите, чтобы оставить отзыв', 'info');
      return;
    }
    const text = newReview.text.trim();
    if (!text) {
      addNotification('Напишите текст отзыва', 'error');
      return;
    }
    const review = {
      name: user.name || 'Покупатель',
      text,
      rating: newReview.rating,
      date: new Date().toLocaleDateString('ru-RU'),
    };
    const updated = [review, ...userReviews];
    setUserReviews(updated);
    localStorage.setItem(`urechki_reviews_${id}`, JSON.stringify(updated));
    setNewReview({ rating: 5, text: '' });
    addNotification('Спасибо! Ваш отзыв опубликован', 'success');
  };

  return (
    <div className="container section-sm">
      <nav className="flex gap-2 wrap small muted" aria-label="Навигационная цепочка" style={{ marginBottom: 24 }}>
        <Link to="/" className="nav-link">Главная</Link>
        <span>/</span>
        <Link to="/catalog" className="nav-link">Каталог</Link>
        <span>/</span>
        <span className="text-accent">{product.name}</span>
      </nav>

      <Link to="/catalog" className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
        <ArrowLeft size={16} /> Назад в каталог
      </Link>

      <div className="grid grid-2 gap-3" style={{ alignItems: 'start' }}>
        <div
          className="product-media"
          style={{ background: categoryGradient(product.category), minHeight: 420, fontSize: '10rem', borderRadius: 20 }}
        >
          <span>{categoryEmoji(product.category)}</span>
          <div className="flex wrap gap-2" style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
            <span className="badge badge-accent">{product.category}</span>
            <span className={`badge ${inStock ? 'badge-success' : 'badge-danger'}`}>
              {inStock ? `В наличии: ${maxQuantity}` : 'Нет в наличии'}
            </span>
          </div>
        </div>

        <div className="stack" style={{ gap: 18 }}>
          <div className="flex gap-2 wrap">
            <span className="rating">
              <Star size={15} fill="currentColor" /> {productRating(product)}
            </span>
            <span className="muted small">{productReviews(product)} отзывов</span>
            <span className="badge">Артикул {sku}</span>
          </div>

          <div>
            <span className="eyebrow">{product.category}</span>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>{product.name}</h1>
          </div>

          <div className="price" style={{ fontSize: '2.4rem' }}>{formatPrice(product.price)}</div>

          {product.description && <p className="muted">{product.description}</p>}

          <div className="flex gap-2 wrap">
            <div className="qty">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1}
                aria-label="Уменьшить количество"
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(maxQuantity || 1, value + 1))}
                disabled={!inStock || quantity >= maxQuantity}
                aria-label="Увеличить количество"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={!inStock}
              onClick={() => addToCart(product, quantity)}
            >
              <ShoppingBag size={19} /> В корзину
            </button>

            <button
              type="button"
              className={`btn ${favorite ? 'btn-primary' : 'btn-outline'} btn-lg`}
              onClick={handleFavorite}
            >
              <Heart size={19} fill={favorite ? 'currentColor' : 'transparent'} />
              {favorite ? 'В избранном' : 'В избранное'}
            </button>
          </div>

          <div className="flex gap-2 wrap">
            <button type="button" className="btn btn-outline" disabled={!inStock} onClick={handleBuyNow}>
              <Zap size={17} /> Купить сейчас
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleCopyLink}>
              <Share2 size={17} /> Поделиться
            </button>
          </div>

          {!inStock && <p className="small muted">Товар временно отсутствует на складе.</p>}

          <div className="flex gap-2 wrap">
            <span className="badge"><Truck size={14} /> Доставка за 1–2 часа</span>
            <span className="badge"><ShieldCheck size={14} /> Безопасная оплата</span>
            <span className="badge"><RefreshCcw size={14} /> Гарантия качества</span>
          </div>
        </div>
      </div>

      <section className="card" style={{ marginTop: 48 }}>
        <div className="tabs">
          <button type="button" className={`tab ${activeTab === 'desc' ? 'tab-active' : ''}`} onClick={() => setActiveTab('desc')}>
            Описание
          </button>
          <button type="button" className={`tab ${activeTab === 'specs' ? 'tab-active' : ''}`} onClick={() => setActiveTab('specs')}>
            Характеристики
          </button>
          <button type="button" className={`tab ${activeTab === 'delivery' ? 'tab-active' : ''}`} onClick={() => setActiveTab('delivery')}>
            Доставка и оплата
          </button>
        </div>

        {activeTab === 'desc' && (
          <div className="stack">
            <p>{product.description || 'Описание товара появится позже.'}</p>
            <p className="muted">
              Наша продукция проходит строгий контроль качества: используем только натуральные ингредиенты
              и бережно упаковываем каждый заказ.
            </p>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="table-wrap">
            <table className="table">
              <tbody>
                <tr>
                  <td className="bold muted">Категория</td>
                  <td>{product.category}</td>
                </tr>
                <tr>
                  <td className="bold muted">Наличие</td>
                  <td>{inStock ? `${maxQuantity} шт.` : 'Нет в наличии'}</td>
                </tr>
                <tr>
                  <td className="bold muted">Артикул (SKU)</td>
                  <td>{sku}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="stack">
            <p>
              Доставляем заказы по городу курьером — обычно в течение 1–2 часов. По России отправляем
              транспортными компаниями, сроки и стоимость уточняются при оформлении заказа.
            </p>
            <p className="muted">
              Оплатить можно онлайн картой при оформлении или наличными при получении. Для самовывоза
              соберите заказ в корзине и выберите удобный способ получения на странице оформления.
            </p>
          </div>
        )}
      </section>

      <section className="card" style={{ marginTop: 28 }}>
        <div className="section-head" style={{ marginBottom: 24 }}>
          <span className="eyebrow">Мнения покупателей</span>
          <h2 style={{ fontSize: '1.7rem' }}>Отзывы ({reviews.length})</h2>
        </div>

        <form className="stack" onSubmit={handleSubmitReview}>
          <span className="form-label">Оставить отзыв</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                type="button"
                key={value}
                className="text-button"
                onClick={() => setNewReview((current) => ({ ...current, rating: value }))}
                aria-label={`Оценка ${value} из 5`}
              >
                <Star size={24} color="var(--accent)" fill={value <= newReview.rating ? 'currentColor' : 'transparent'} />
              </button>
            ))}
            <span className="muted small" style={{ marginLeft: 6 }}>{newReview.rating} из 5</span>
          </div>
          <textarea
            className="textarea"
            placeholder="Поделитесь впечатлениями о товаре…"
            value={newReview.text}
            onChange={(event) => setNewReview((current) => ({ ...current, text: event.target.value }))}
            aria-label="Текст отзыва"
          />
          <div className="flex gap-2 wrap">
            <button type="submit" className="btn btn-primary">
              <MessageSquare size={17} /> Отправить отзыв
            </button>
            {!user && <span className="muted small">Чтобы оставить отзыв, войдите в аккаунт</span>}
          </div>
        </form>

        <div className="divider" />

        <div className="stack">
          {reviews.map((review, index) => (
            <div
              className="glass-panel"
              key={`${review.name}-${index}`}
              style={{ padding: 18, borderLeft: '3px solid var(--accent)' }}
            >
              <div className="flex between gap-2 wrap">
                <strong>{review.name}</strong>
                <span className="rating">{'★'.repeat(review.rating)}</span>
              </div>
              <p className="muted" style={{ margin: '8px 0' }}>{review.text}</p>
              <span className="tiny dim">{review.date}</span>
            </div>
          ))}
        </div>
      </section>

      {relatedLoading && <div style={{ marginTop: 56 }}><ProductGridSkeleton count={4} /></div>}

      {!relatedLoading && related.length > 0 && (
        <section style={{ marginTop: 56 }}>
          <div className="section-head">
            <span className="eyebrow">Из той же категории</span>
            <h2 style={{ fontSize: '1.8rem' }}>Похожие товары</h2>
          </div>
          <div className="grid grid-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        </section>
      )}

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}

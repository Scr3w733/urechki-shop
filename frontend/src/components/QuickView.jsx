import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, ArrowRight } from 'lucide-react';
import Modal from './Modal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { categoryEmoji, categoryGradient, formatPrice, productRating, productReviews } from '../utils/product';

export default function QuickView({ product, onClose }) {
  const { addToCart } = useCart();
  const { user, toggleWishlist, isInWishlist } = useAuth();
  const { addNotification } = useNotification();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;
  const inStock = (product.stockQuantity ?? 0) > 0;
  const favorite = isInWishlist(product.id);

  const handleFavorite = () => {
    if (!user) return addNotification('Войдите, чтобы добавить в избранное', 'info');
    toggleWishlist(product);
    addNotification(favorite ? 'Удалено из избранного' : 'В избранном', 'success');
  };

  return (
    <Modal open={!!product} onClose={onClose} size="lg" title={<span className="eyebrow" style={{ margin: 0 }}>Быстрый просмотр</span>}>
      <div className="quick-view">
        <div className="quick-view-media" style={{ background: categoryGradient(product.category) }}>
          <span style={{ fontSize: '8rem' }}>{categoryEmoji(product.category)}</span>
          <span className="badge badge-accent" style={{ position: 'absolute', top: 16, left: 16 }}>{product.category}</span>
        </div>
        <div className="stack">
          <div>
            <div className="flex gap-2" style={{ marginBottom: 10 }}>
              <span className="rating"><Star size={14} fill="currentColor" /> {productRating(product)}</span>
              <span className="muted small">{productReviews(product)} отзывов</span>
              <span className={`badge ${inStock ? 'badge-success' : 'badge-danger'}`}>{inStock ? 'В наличии' : 'Нет в наличии'}</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: 12 }}>{product.name}</h2>
            <p>{product.description}</p>
          </div>

          <div className="price" style={{ fontSize: '2rem' }}>{formatPrice(product.price)}</div>

          <div className="flex gap-2 wrap">
            <div className="qty">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>–</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stockQuantity ?? 99, q + 1))}>+</button>
            </div>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={!inStock} onClick={() => { addToCart(product, quantity); onClose(); }}>
              <ShoppingBag size={18} /> В корзину
            </button>
            <button className="icon-btn" onClick={handleFavorite} aria-label="В избранное">
              <Heart size={19} fill={favorite ? '#ef4444' : 'transparent'} color={favorite ? '#ef4444' : 'currentColor'} />
            </button>
          </div>

          <Link to={`/product/${product.id}`} onClick={onClose} className="btn btn-outline btn-block">
            Полное описание <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </Modal>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { categoryGradient, formatPrice, productImage, productRating } from '../utils/product';

export default function ProductCard({ product, onQuickView, list = false }) {
  const { addToCart } = useCart();
  const { user, toggleWishlist, isInWishlist } = useAuth();
  const { addNotification } = useNotification();
  if (!product) return null;

  const favorite = isInWishlist(product.id);
  const inStock = (product.stockQuantity ?? 0) > 0;

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      addNotification('Войдите, чтобы добавлять товары в избранное', 'info');
      return;
    }
    toggleWishlist(product);
    addNotification(favorite ? 'Удалено из избранного' : 'Добавлено в избранное', 'success');
  };

  return (
    <motion.article
      className="product-card card-hover"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      style={list ? { flexDirection: 'row', alignItems: 'stretch' } : undefined}
    >
      <div
        className="product-media"
        style={{ ...(list ? { minWidth: 190, minHeight: 170 } : {}), background: categoryGradient(product.category) }}
      >
        <img
          className="product-image"
          src={productImage(product)}
          alt={product.name}
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
        <span className="product-badge badge badge-accent">{product.category}</span>
        <div className="product-actions">
          <button className="icon-btn" onClick={handleFavorite} title="В избранное" aria-label="В избранное">
            <Heart size={17} fill={favorite ? '#ef4444' : 'transparent'} color={favorite ? '#ef4444' : 'currentColor'} />
          </button>
          {onQuickView && (
            <button className="icon-btn" onClick={(e) => { e.preventDefault(); onQuickView(product); }} title="Быстрый просмотр" aria-label="Быстрый просмотр">
              <Eye size={17} />
            </button>
          )}
        </div>
      </div>

      <div className="product-body">
        <Link to={`/product/${product.id}`} className="product-title">{product.name}</Link>
        <p className="product-desc">{product.description || 'Описание появится позже'}</p>
        <div className="flex gap-2 wrap">
          <span className="rating"><Star size={13} fill="currentColor" /> {productRating(product)}</span>
          <span className={`badge ${inStock ? 'badge-success' : 'badge-danger'}`}>
            {inStock ? `В наличии: ${product.stockQuantity}` : 'Нет в наличии'}
          </span>
        </div>
        <div className="product-footer">
          <div>
            <div className="price">{formatPrice(product.price)}</div>
            {Number(product.id) % 3 === 0 && <span className="price-old">{formatPrice(Number(product.price) * 1.1)}</span>}
          </div>
          <button
            className="btn btn-primary btn-sm"
            disabled={!inStock}
            onClick={() => addToCart(product)}
            title={inStock ? 'Добавить в корзину' : 'Нет в наличии'}
          >
            <ShoppingBag size={16} /> В корзину
          </button>
        </div>
      </div>
    </motion.article>
  );
}

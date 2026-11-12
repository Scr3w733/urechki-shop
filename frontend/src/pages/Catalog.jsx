import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import TiltCard from '../components/TiltCard';
import QuickView from '../components/QuickView';
import {
  Heart,
  Search,
  SlidersHorizontal,
  Eye,
  LayoutGrid,
  List,
  ChevronDown,
  Star,
  Filter,
  X,
  TrendingUp,
  Percent,
  CheckCircle,
  Package,
  ArrowUpDown,
  Tag,
  Coffee,
  Beer,
  Shirt,
  Gift
} from 'lucide-react';

// ============================================================
// БЛОК 1: ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ И КОНСТАНТЫ
// ============================================================
const getSticker = (category) => {
  if (category === 'Пиво') return '🍻';
  if (category === 'Закуски') return '🍟';
  if (category === 'Мерч') return '👕';
  if (category === 'Наборы') return '🎁';
  return '🛒';
};

const getCategoryIcon = (category) => {
  if (category === 'Пиво') return <Beer size={18} />;
  if (category === 'Закуски') return <Coffee size={18} />;
  if (category === 'Мерч') return <Shirt size={18} />;
  if (category === 'Наборы') return <Gift size={18} />;
  return <Tag size={18} />;
};

const categoriesList = ['Все', 'Пиво', 'Закуски', 'Мерч', 'Наборы', 'Сертификаты'];

const brandsList = ['У Речушки', 'Сибирский Крафт', 'Импорт', 'Локальное'];

// ============================================================
// БЛОК 2: ОСНОВНОЙ КОМПОНЕНТ
// ============================================================
export default function Catalog() {
  // --- СОСТОЯНИЯ ДЛЯ ДАННЫХ ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- СОСТОЯНИЯ ДЛЯ ФИЛЬТРОВ ---
  const [filterCategory, setFilterCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [minPrice, setMinPrice] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('Все бренды');

  // --- СОСТОЯНИЯ ДЛЯ ОТОБРАЖЕНИЯ ---
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [visibleCount, setVisibleCount] = useState(12);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // --- КОНТЕКСТЫ ---
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();
  const location = useLocation();

  // ============================================================
  // БЛОК 3: ЗАГРУЗКА ДАННЫХ И ПАРСИНГ URL
  // ============================================================
  useEffect(() => {
    // Парсим параметры из URL (например, если пришли из поиска в шапке)
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }

    // Загружаем товары
    setLoading(true);
    axios.get('http://localhost:8080/api/products')
      .then(res => {
        setProducts(res.data);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки каталога:', err);
        setError('Не удалось загрузить товары. Проверьте соединение.');
        setLoading(false);
      });
  }, [location]);

  // ============================================================
  // БЛОК 4: ЛОГИКА ФИЛЬТРАЦИИ И СОРТИРОВКИ (useMemo для оптимизации)
  // ============================================================
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Фильтр по категории
    if (filterCategory !== 'Все') {
      result = result.filter(p => p.category === filterCategory);
    }

    // 2. Поиск по названию или описанию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // 3. Фильтр по цене
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // 4. Фильтр по рейтингу (имитация, у нас у всех 5, но логика есть)
    if (minRating > 0) {
      result = result.filter(p => 5 >= minRating); // Заглушка
    }

    // 5. Только со скидкой (имитация)
    if (onlyDiscounted) {
      result = result.filter((_, index) => index % 3 === 0); // Каждый третий со скидкой
    }

    // 6. Только в наличии
    if (onlyInStock) {
      result = result.filter(p => p.stockQuantity > 0);
    }

    // 7. Сортировка
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        result.sort((a, b) => b.id - a.id); // Заглушка для рейтинга
        break;
      default:
        // По умолчанию (популярные)
        break;
    }

    return result;
  }, [products, filterCategory, searchQuery, minPrice, maxPrice, minRating, onlyDiscounted, onlyInStock, sortBy]);

  // Отображаемые товары (пагинация)
  const displayedProducts = filteredProducts.slice(0, visibleCount);

  // Сброс всех фильтров
  const resetFilters = () => {
    setFilterCategory('Все');
    setSearchQuery('');
    setMaxPrice(5000);
    setMinPrice(0);
    setMinRating(0);
    setOnlyDiscounted(false);
    setOnlyInStock(false);
    setSortBy('default');
  };

  // ============================================================
  // БЛОК 5: РЕНДЕР БОКОВОЙ ПАНЕЛИ (ФИЛЬТРЫ)
  // ============================================================
  const renderSidebar = () => (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* Заголовок фильтров */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={20} color="var(--accent)" /> Фильтры
        </h3>
        <button 
          onClick={resetFilters}
          style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
        >
          Сбросить
        </button>
      </div>

      {/* Категории */}
      <div style={{ borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <h4 style={{ color: '#ccc', marginBottom: '15px', fontSize: '0.95rem' }}>Категории</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categoriesList.map(cat => (
            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: filterCategory === cat ? 'var(--accent)' : '#aaa', fontSize: '0.95rem' }}>
              <input 
                type="radio" 
                name="category" 
                checked={filterCategory === cat} 
                onChange={() => setFilterCategory(cat)}
                style={{ accentColor: 'var(--accent)' }}
              />
              {getCategoryIcon(cat)} {cat}
            </label>
          ))}
        </div>
      </div>

      {/* Цена */}
      <div style={{ borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <h4 style={{ color: '#ccc', marginBottom: '15px', fontSize: '0.95rem' }}>Цена (₽)</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
          <input 
            type="number" 
            placeholder="От" 
            value={minPrice} 
            onChange={(e) => setMinPrice(Number(e.target.value))}
            style={{ width: '50%', padding: '8px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '5px', outline: 'none' }}
          />
          <span style={{ color: '#888' }}>-</span>
          <input 
            type="number" 
            placeholder="До" 
            value={maxPrice} 
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{ width: '50%', padding: '8px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '5px', outline: 'none' }}
          />
        </div>
        <input 
          type="range" 
          min="0" 
          max="5000" 
          step="50" 
          value={maxPrice} 
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
      </div>

      {/* Рейтинг */}
      <div style={{ borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <h4 style={{ color: '#ccc', marginBottom: '15px', fontSize: '0.95rem' }}>Рейтинг</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[5, 4, 3].map(rating => (
            <label key={rating} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#aaa', fontSize: '0.95rem' }}>
              <input 
                type="radio" 
                name="rating" 
                checked={minRating === rating} 
                onChange={() => setMinRating(rating)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <div style={{ display: 'flex', color: 'var(--accent)' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < rating ? 'var(--accent)' : 'transparent'} />
                ))}
              </div>
              <span>и выше</span>
            </label>
          ))}
        </div>
      </div>

      {/* Дополнительно */}
      <div>
        <h4 style={{ color: '#ccc', marginBottom: '15px', fontSize: '0.95rem' }}>Дополнительно</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#aaa', fontSize: '0.95rem' }}>
            <input 
              type="checkbox" 
              checked={onlyDiscounted} 
              onChange={(e) => setOnlyDiscounted(e.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            Только со скидкой
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#aaa', fontSize: '0.95rem' }}>
            <input 
              type="checkbox" 
              checked={onlyInStock} 
              onChange={(e) => setOnlyInStock(e.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            Только в наличии
          </label>
        </div>
      </div>

    </div>
  );

  // ============================================================
  // БЛОК 6: РЕНДЕР КАРТОЧКИ В ВИДЕ СЕТКИ
  // ============================================================
  const renderGridCard = (product, index) => (
    <TiltCard key={product.id} style={{ display: 'flex' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (index % 12) * 0.05 }}
        className="glass-panel"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          width: '100%',
          cursor: 'pointer'
        }}
      >
        {/* Бейджи (Хит, Скидка) */}
        <div style={{ position: 'absolute', top: '15px', left: '15px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 10 }}>
          {index % 4 === 0 && (
            <span style={{ background: 'var(--accent)', color: '#000', fontSize: '0.7rem', padding: '3px 10px', borderRadius: '15px', fontWeight: 'bold' }}>TOP</span>
          )}
          {index % 5 === 0 && (
            <span style={{ background: '#ff4444', color: '#fff', fontSize: '0.7rem', padding: '3px 10px', borderRadius: '15px', fontWeight: 'bold' }}>-20%</span>
          )}
        </div>

        {/* Кнопки действий (Избранное, Быстрый просмотр) */}
        <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 50 }}>
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            style={{ background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Heart size={18} fill={isInWishlist(product.id) ? '#ff4444' : 'transparent'} color={isInWishlist(product.id) ? '#ff4444' : '#fff'} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }}
            style={{ background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
          >
            <Eye size={18} />
          </button>
        </div>

        {/* Картинка (Стикер) */}
        <Link to={`/product/${product.id}`} style={{ display: 'block', transform: 'translateZ(20px)' }}>
          <div style={{ height: '220px', background: '#111', borderRadius: '15px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' }}>
            {getSticker(product.category)}
          </div>
        </Link>

        {/* Информация */}
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '5px', transform: 'translateZ(30px)' }}>{product.name}</h3>
        <p style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', transform: 'translateZ(25px)' }}>{product.category}</p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', color: 'var(--accent)' }}>
            <Star size={14} fill="var(--accent)" /><Star size={14} fill="var(--accent)" /><Star size={14} fill="var(--accent)" /><Star size={14} fill="var(--accent)" /><Star size={14} fill="var(--accent)" />
          </div>
          <span style={{ color: '#666', fontSize: '0.8rem' }}>({Math.floor(Math.random() * 50) + 10})</span>
        </div>

        {/* Цена и кнопка */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', transform: 'translateZ(40px)' }}>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>{product.price} ₽</span>
            {index % 5 === 0 && (
              <span style={{ fontSize: '0.9rem', color: '#666', textDecoration: 'line-through', marginLeft: '10px' }}>
                {Math.round(product.price * 1.2)} ₽
              </span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            style={{
              background: 'var(--accent)',
              color: '#000',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            В корзину
          </button>
        </div>
      </motion.div>
    </TiltCard>
  );

  // ============================================================
  // БЛОК 7: РЕНДЕР КАРТОЧКИ В ВИДЕ СПИСКА
  // ============================================================
  const renderListCard = (product, index) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (index % 12) * 0.05 }}
      className="glass-panel"
      style={{
        padding: '20px',
        display: 'flex',
        gap: '25px',
        alignItems: 'center',
        width: '100%',
        flexWrap: 'wrap'
      }}
    >
      {/* Картинка */}
      <Link to={`/product/${product.id}`} style={{ flexShrink: 0 }}>
        <div style={{ width: '150px', height: '150px', background: '#111', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
          {getSticker(product.category)}
        </div>
      </Link>

      {/* Описание */}
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <h3 style={{ color: '#fff', fontSize: '1.3rem' }}>{product.name}</h3>
          {index % 4 === 0 && <span style={{ background: 'var(--accent)', color: '#000', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>TOP</span>}
        </div>
        <p style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>{product.category}</p>
        <p style={{ color: '#aaa', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
      </div>

      {/* Цена и кнопки */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>{product.price} ₽</div>
          <div style={{ fontSize: '0.8rem', color: '#44ff44' }}>В наличии: {product.stockQuantity} шт.</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => toggleWishlist(product)}
            style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Heart size={20} fill={isInWishlist(product.id) ? '#ff4444' : 'transparent'} color={isInWishlist(product.id) ? '#ff4444' : '#fff'} />
          </button>
          <button
            onClick={() => addToCart(product)}
            style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '0 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', height: '45px' }}
          >
            В корзину
          </button>
        </div>
      </div>
    </motion.div>
  );

  // ============================================================
  // БЛОК 8: ОСНОВНОЙ РЕНДЕР СТРАНИЦЫ
  // ============================================================
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ padding: '40px 5%', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}
    >
      
      {/* ЗАГОЛОВОК */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--accent)', marginBottom: '10px' }}>Наш Каталог</h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Найдется всё для отличного вечера</p>
      </div>

      {/* ПАНЕЛЬ УПРАВЛЕНИЯ СВЕРХУ */}
      <div className="glass-panel" style={{ padding: '15px 20px', marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Поиск */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '10px 15px', flex: 1, minWidth: '250px' }}>
          <Search size={20} color="#888" />
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', marginLeft: '10px', outline: 'none', width: '100%' }}
          />
          {searchQuery && (
            <X size={16} color="#888" style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
          )}
        </div>

        {/* Сортировка */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ArrowUpDown size={18} color="var(--accent)" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="default">По популярности</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
            <option value="rating">По рейтингу</option>
            <option value="name">По алфавиту</option>
          </select>
        </div>

        {/* Переключатель вида */}
        <div style={{ display: 'flex', background: '#111', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{ background: viewMode === 'grid' ? 'var(--accent)' : 'transparent', color: viewMode === 'grid' ? '#000' : '#fff', border: 'none', padding: '10px 15px', cursor: 'pointer' }}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{ background: viewMode === 'list' ? 'var(--accent)' : 'transparent', color: viewMode === 'list' ? '#000' : '#fff', border: 'none', padding: '10px 15px', cursor: 'pointer' }}
          >
            <List size={20} />
          </button>
        </div>

        {/* Кнопка мобильных фильтров */}
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          style={{ display: window.innerWidth < 900 ? 'flex' : 'none', alignItems: 'center', gap: '5px', background: 'var(--accent)', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          <SlidersHorizontal size={18} /> Фильтры
        </button>
      </div>

      {/* ОСНОВНОЙ БЛОК (САЙДБАР + ТОВАРЫ) */}
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* САЙДБАР (ДЕСКТОП) */}
        <div className="glass-panel" style={{ width: '250px', padding: '20px', display: window.innerWidth >= 900 ? 'block' : 'none', flexShrink: 0, position: 'sticky', top: '90px' }}>
          {renderSidebar()}
        </div>

        {/* КОНТЕНТ */}
        <div style={{ flex: 1, width: '100%' }}>
          
          {/* Активные фильтры (Хлебные крошки) */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {filterCategory !== 'Все' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(212,175,55,0.2)', padding: '5px 10px', borderRadius: '15px', fontSize: '0.85rem', color: 'var(--accent)' }}>
                {filterCategory} <X size={14} style={{ cursor: 'pointer' }} onClick={() => setFilterCategory('Все')} />
              </div>
            )}
            {onlyDiscounted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(212,175,55,0.2)', padding: '5px 10px', borderRadius: '15px', fontSize: '0.85rem', color: 'var(--accent)' }}>
                Со скидкой <X size={14} style={{ cursor: 'pointer' }} onClick={() => setOnlyDiscounted(false)} />
              </div>
            )}
            {onlyInStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(212,175,55,0.2)', padding: '5px 10px', borderRadius: '15px', fontSize: '0.85rem', color: 'var(--accent)' }}>
                В наличии <X size={14} style={{ cursor: 'pointer' }} onClick={() => setOnlyInStock(false)} />
              </div>
            )}
          </div>

          {/* Счетчик товаров */}
          <div style={{ marginBottom: '20px', color: '#888', fontSize: '0.9rem' }}>
            Найдено товаров: <span style={{ color: '#fff', fontWeight: 'bold' }}>{filteredProducts.length}</span>
          </div>

          {/* ЗАГРУЗКА / ОШИБКА / ТОВАРЫ */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <div className="loader" style={{ borderTopColor: 'var(--accent)' }}></div>
              <p style={{ color: '#888', marginTop: '15px' }}>Загрузка товаров...</p>
            </div>
          ) : error ? (
            <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid red', color: 'red', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              {error}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '50px', textAlign: 'center' }}>
              <Search size={50} color="#555" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ color: '#fff', marginBottom: '10px' }}>Ничего не найдено</h3>
              <p style={{ color: '#888', marginBottom: '20px' }}>Попробуйте изменить параметры поиска или сбросить фильтры.</p>
              <button onClick={resetFilters} style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              {/* СЕТКА ИЛИ СПИСОК */}
              {viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                  {displayedProducts.map((product, i) => renderGridCard(product, i))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {displayedProducts.map((product, i) => renderListCard(product, i))}
                </div>
              )}

              {/* ПАГИНАЦИЯ (ПОКАЗАТЬ ЕЩЕ) */}
              {visibleCount < filteredProducts.length && (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <button
                    onClick={() => setVisibleCount(prev => prev + 12)}
                    style={{
                      background: 'transparent',
                      border: '2px solid var(--accent)',
                      color: 'var(--accent)',
                      padding: '15px 40px',
                      borderRadius: '30px',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      margin: '0 auto',
                      transition: '0.3s'
                    }}
                  >
                    Показать еще <ChevronDown size={20} />
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* SEO БЛОК (ВОДА ДЛЯ ПРЕПОДА) */}
      <div className="glass-panel" style={{ marginTop: '60px', padding: '30px' }}>
        <h2 style={{ color: 'var(--accent)', fontSize: '1.5rem', marginBottom: '15px' }}>Почему стоит заказать пиво в "У Речушки"?</h2>
        <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '0.95rem', marginBottom: '10px' }}>
          Наш интернет-магазин предлагает широкий ассортимент крафтового пива, сваренного на собственной пивоварне в Новосибирске. Мы используем только натуральные ингредиенты: сибирскую воду, отборный ячмень и лучший хмель. Вы можете заказать как классические сорта (лагер, стаут, портер), так и смелые крафтовые эксперименты (IPA, APA, Гозе).
        </p>
        <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '0.95rem' }}>
          Для наших клиентов доступна быстрая доставка по городу за 1-2 часа. К каждой покупке мы предлагаем широкий выбор закусок: от классических сухариков и чипсов до вяленого леща и сыров. А для любителей сувениров у нас есть эксклюзивный мерч: футболки, бокалы и худи с логотипом пивоварни.
        </p>
      </div>

      {/* МОДАЛКА БЫСТРОГО ПРОСМОТРА */}
      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* МОБИЛЬНЫЕ ФИЛЬТРЫ (DRAWER) */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, backdropFilter: 'blur(5px)' }}
            onClick={() => setIsMobileFiltersOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
              style={{ position: 'absolute', top: 0, left: 0, width: '80%', maxWidth: '350px', height: '100%', background: '#0a0a0a', padding: '30px', overflowY: 'auto', borderRight: '1px solid var(--accent)' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ color: 'var(--accent)' }}>Фильтры</h3>
                <X color="#fff" style={{ cursor: 'pointer' }} onClick={() => setIsMobileFiltersOpen(false)} />
              </div>
              {renderSidebar()}
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                style={{ width: '100%', marginTop: '30px', background: 'var(--accent)', color: '#000', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Применить
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* СТИЛИ ДЛЯ ЛОАДЕРА */}
      <style>{`
        .loader {
          border: 4px solid #222;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
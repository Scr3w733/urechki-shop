import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronDown,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import QuickView from '../components/QuickView';
import { ProductGridSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useNotification } from '../context/NotificationContext';

const PAGE_SIZE = 12;
const SEARCH_DELAY = 350;

const plural = (count, one, few, many) => {
  const n = Math.abs(count) % 100;
  const last = n % 10;
  if (n > 10 && n < 20) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
};

function FiltersPanel({
  categories,
  category,
  onCategory,
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  onlyInStock,
  onOnlyInStock,
  onReset,
}) {
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="flex between gap-2">
        <h3 style={{ fontSize: '1.2rem' }}>Фильтры</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
          Сбросить
        </button>
      </div>

      <div className="divider" style={{ margin: 0 }} />

      <div>
        <span className="form-label">Категория</span>
        <div className="flex wrap gap-2" style={{ marginTop: 10 }}>
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              className={`chip ${category === item ? 'chip-active' : ''}`}
              onClick={() => onCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="form-label">Цена, ₽</span>
        <div className="flex gap-2" style={{ marginTop: 10 }}>
          <input
            className="input"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="От"
            value={minPrice}
            onChange={(event) => onMinPrice(event.target.value)}
            aria-label="Минимальная цена"
          />
          <input
            className="input"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="До"
            value={maxPrice}
            onChange={(event) => onMaxPrice(event.target.value)}
            aria-label="Максимальная цена"
          />
        </div>
        <p className="tiny dim" style={{ marginTop: 8 }}>
          Оставьте поле пустым, чтобы не ограничивать цену
        </p>
      </div>

      <div className="divider" style={{ margin: 0 }} />

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={onlyInStock}
          onChange={(event) => onOnlyInStock(event.target.checked)}
        />
        Только в наличии
      </label>
    </div>
  );
}

export default function Catalog() {
  const { addNotification } = useNotification();

  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(urlSearch);
  const lastSearchRef = useRef(urlSearch);
  const searchTimerRef = useRef(null);
  const notifiedRef = useRef('');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Все']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [filterCategory, setFilterCategory] = useState('Все');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Поиск из шапки приходит через URL — подхватываем внешние изменения.
  useEffect(() => {
    if (urlSearch !== lastSearchRef.current) {
      lastSearchRef.current = urlSearch;
      setSearchInput(urlSearch);
    }
  }, [urlSearch]);

  // Своё поле поиска дебаунсим и записываем обратно в URL.
  useEffect(() => {
    if (searchInput === lastSearchRef.current) return undefined;
    searchTimerRef.current = window.setTimeout(() => {
      searchTimerRef.current = null;
      const value = searchInput.trim();
      lastSearchRef.current = value;
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set('search', value);
        else next.delete('search');
        return next;
      }, { replace: true });
    }, SEARCH_DELAY);
    return () => window.clearTimeout(searchTimerRef.current);
  }, [searchInput, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    axios.get('/api/products/categories')
      .then((response) => {
        if (cancelled) return;
        const list = Array.isArray(response.data) ? response.data.filter(Boolean) : [];
        setCategories(['Все', ...list]);
      })
      .catch((error) => {
        if (cancelled) return;
        setCategories(['Все']);
        const message = error.response?.data?.message || 'Не удалось загрузить категории';
        if (notifiedRef.current !== message) {
          notifiedRef.current = message;
          addNotification(message, 'error');
        }
      });
    return () => { cancelled = true; };
  }, [addNotification]);

  // Единый источник истины — фильтры уходят на сервер, ответ даёт точный счётчик.
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const params = {};
    if (filterCategory !== 'Все') params.category = filterCategory;
    if (urlSearch.trim()) params.search = urlSearch.trim();

    const min = Number(minPrice);
    if (minPrice !== '' && Number.isFinite(min) && min >= 0) params.minPrice = min;
    const max = Number(maxPrice);
    if (maxPrice !== '' && Number.isFinite(max) && max >= 0) params.maxPrice = max;
    if (onlyInStock) params.onlyInStock = true;
    if (sortBy !== 'default') params.sort = sortBy;

    setLoading(true);
    axios.get('/api/products', { params, signal: controller.signal })
      .then((response) => {
        if (cancelled) return;
        setProducts(Array.isArray(response.data) ? response.data : []);
        setError('');
        notifiedRef.current = '';
      })
      .catch((requestError) => {
        if (cancelled || axios.isCancel(requestError)) return;
        const message = requestError.response?.data?.message
          || 'Не удалось загрузить товары. Проверьте соединение.';
        setProducts([]);
        setError(message);
        if (notifiedRef.current !== message) {
          notifiedRef.current = message;
          addNotification(message, 'error');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; controller.abort(); };
  }, [filterCategory, urlSearch, minPrice, maxPrice, onlyInStock, sortBy, reloadKey, addNotification]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [products, filterCategory, urlSearch, minPrice, maxPrice, onlyInStock, sortBy]);

  const clearSearch = () => {
    window.clearTimeout(searchTimerRef.current);
    searchTimerRef.current = null;
    setSearchInput('');
    lastSearchRef.current = '';
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('search');
      return next;
    }, { replace: true });
  };

  const resetFilters = () => {
    setFilterCategory('Все');
    setMinPrice('');
    setMaxPrice('');
    setOnlyInStock(false);
    setSortBy('default');
    setVisibleCount(PAGE_SIZE);
    clearSearch();
  };

  const hasActiveFilters = filterCategory !== 'Все'
    || minPrice !== ''
    || maxPrice !== ''
    || onlyInStock
    || Boolean(urlSearch);

  const displayedProducts = products.slice(0, visibleCount);
  const remaining = products.length - displayedProducts.length;

  const filterProps = {
    categories,
    category: filterCategory,
    onCategory: setFilterCategory,
    minPrice,
    maxPrice,
    onMinPrice: setMinPrice,
    onMaxPrice: setMaxPrice,
    onlyInStock,
    onOnlyInStock: setOnlyInStock,
    onReset: resetFilters,
  };

  return (
    <div className="container section-sm">
      <header className="section-head">
        <span className="eyebrow">Крафтовые напитки и не только</span>
        <h1>Каталог</h1>
        <p className="muted">Выбирайте пиво, закуски и мерч — доставим по городу в день заказа.</p>
      </header>

      <div className="glass-panel" style={{ padding: 18, marginBottom: 24 }}>
        <div className="flex wrap gap-3">
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              aria-hidden="true"
            />
            <input
              className="input"
              type="search"
              placeholder="Поиск по названию или описанию"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              style={{ paddingLeft: 42, paddingRight: 40 }}
              aria-label="Поиск по каталогу"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                title="Очистить поиск"
                aria-label="Очистить поиск"
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', color: 'var(--text-dim)', padding: 6, display: 'grid', placeItems: 'center' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <select
            className="select"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            style={{ width: 'auto', minWidth: 190 }}
            aria-label="Сортировка товаров"
          >
            <option value="default">По популярности</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
            <option value="name">По алфавиту</option>
            <option value="stock">По наличию</option>
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('grid')}
              title="Сетка"
              aria-label="Показать сеткой"
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid size={17} />
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('list')}
              title="Список"
              aria-label="Показать списком"
              aria-pressed={viewMode === 'list'}
            >
              <List size={17} />
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm mobile-burger"
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal size={16} /> Фильтры
          </button>
        </div>

        <div className="flex wrap gap-2" style={{ marginTop: 18 }}>
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              className={`chip ${filterCategory === item ? 'chip-active' : ''}`}
              onClick={() => setFilterCategory(item)}
              aria-pressed={filterCategory === item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3" style={{ alignItems: 'flex-start' }}>
        <aside className="glass-panel hide-mobile" style={{ flex: '0 0 260px', padding: 20, position: 'sticky', top: 92 }}>
          <FiltersPanel {...filterProps} />
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex between wrap gap-2" style={{ marginBottom: 18 }}>
            <p className="muted small" style={{ margin: 0 }}>
              {loading
                ? 'Загружаем товары…'
                : `${products.length} ${plural(products.length, 'товар', 'товара', 'товаров')}`}
            </p>
            {hasActiveFilters && (
              <div className="flex wrap gap-2">
                {filterCategory !== 'Все' && (
                  <button type="button" className="chip flex gap-2" onClick={() => setFilterCategory('Все')}>
                    {filterCategory} <X size={13} />
                  </button>
                )}
                {onlyInStock && (
                  <button type="button" className="chip flex gap-2" onClick={() => setOnlyInStock(false)}>
                    В наличии <X size={13} />
                  </button>
                )}
                {(minPrice !== '' || maxPrice !== '') && (
                  <button type="button" className="chip flex gap-2" onClick={() => { setMinPrice(''); setMaxPrice(''); }}>
                    {minPrice || '0'} – {maxPrice || '∞'} ₽ <X size={13} />
                  </button>
                )}
                {urlSearch && (
                  <button type="button" className="chip flex gap-2" onClick={clearSearch}>
                    «{urlSearch}» <X size={13} />
                  </button>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <EmptyState
              icon={<AlertTriangle size={46} />}
              title="Не удалось загрузить каталог"
              description={error}
              action={<button type="button" className="btn btn-primary" onClick={() => setReloadKey((key) => key + 1)}>Повторить</button>}
            />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Search size={46} />}
              title="Ничего не найдено"
              description="Попробуйте изменить параметры поиска или сбросить фильтры."
              action={<button type="button" className="btn btn-primary" onClick={resetFilters}>Сбросить фильтры</button>}
            />
          ) : (
            <>
              <div className={viewMode === 'grid' ? 'grid grid-4' : 'stack'}>
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                    list={viewMode === 'list'}
                  />
                ))}
              </div>

              <div className="text-center" style={{ marginTop: 36 }}>
                <p className="muted small" style={{ marginBottom: 14 }}>
                  Показано {displayedProducts.length} из {products.length}
                </p>
                {remaining > 0 && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  >
                    Показать ещё ({remaining}) <ChevronDown size={17} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 56 }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Почему «У Речушки»?</h2>
        <p className="muted">
          Варим крафтовое пиво на собственной пивоварне в Новосибирске: сибирская вода, отборный ячмень и лучший хмель.
          От классических лагеров и стаутов до смелых IPA и гозе — у каждого сорта свой характер.
        </p>
        <p className="muted" style={{ marginTop: 10 }}>
          Доставка по городу за 1–2 часа, а к заказу всегда можно добавить закуски, мерч или подарочный сертификат.
        </p>
      </div>

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFiltersOpen(false)}
          >
            <motion.aside
              className="glass-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
              aria-label="Фильтры каталога"
              style={{ position: 'fixed', top: 0, left: 0, zIndex: 2001, width: 'min(88vw, 340px)', height: '100vh', borderRadius: 0, padding: 24, overflowY: 'auto' }}
            >
              <FiltersPanel {...filterProps} />
              <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 28 }} onClick={() => setFiltersOpen(false)}>
                Показать товары
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

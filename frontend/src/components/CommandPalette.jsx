import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Compass, CornerDownLeft, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

const QUICK_LINKS = [
  { id: 'link-catalog', name: 'Каталог', path: '/catalog', type: 'Страница' },
  { id: 'link-profile', name: 'Профиль', path: '/profile', type: 'Страница' },
  { id: 'link-roulette', name: 'Рулетка', path: '/roulette', type: 'Страница' },
  { id: 'link-app', name: 'Приложение', path: '/app', type: 'Страница' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const openPalette = () => {
    setQuery('');
    setActiveIndex(0);
    setLoadError(false);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(0);
    setLoadError(false);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (isOpen) close();
        else openPalette();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    axios.get('/api/products')
      .then((response) => {
        if (!cancelled) setProducts(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setLoadError(true);
        }
      });

    return () => { cancelled = true; };
  }, [isOpen]);

  const items = useMemo(() => {
    const search = query.trim();
    if (!search) return QUICK_LINKS;

    const foundProducts = products
      .filter((product) => (product.name || '').toLowerCase().includes(search.toLowerCase()))
      .slice(0, 6)
      .map((product) => ({
        id: `product-${product.id}`,
        name: product.name,
        path: `/product/${product.id}`,
        type: 'Товар',
        price: product.price,
      }));

    const foundLinks = QUICK_LINKS.filter((link) => link.name.toLowerCase().includes(search.toLowerCase()));
    const allResults = {
      id: 'search-all',
      name: `Все результаты по запросу «${search}»`,
      path: `/catalog?search=${encodeURIComponent(search)}`,
      type: 'Поиск',
    };

    return [...foundProducts, ...foundLinks, allResults];
  }, [query, products]);

  const safeIndex = items.length ? Math.min(activeIndex, items.length - 1) : 0;

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [safeIndex, items]);

  const select = (item) => {
    if (!item) return;
    navigate(item.path);
    close();
  };

  const onInputKeyDown = (event) => {
    const count = items.length;
    if (event.key === 'ArrowDown' && count) {
      event.preventDefault();
      setActiveIndex((index) => (Math.min(index, count - 1) + 1) % count);
    } else if (event.key === 'ArrowUp' && count) {
      event.preventDefault();
      setActiveIndex((index) => (Math.min(index, count - 1) - 1 + count) % count);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      select(items[safeIndex]);
    }
  };

  return (
    <Modal open={isOpen} onClose={close} title="Быстрый поиск">
      <div className="flex gap-2" style={{ paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
        <input
          ref={inputRef}
          className="input"
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onInputKeyDown}
          placeholder="Найти товар или раздел…"
          aria-label="Поиск по сайту"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-results"
          aria-activedescendant={items[safeIndex] ? `cmd-${items[safeIndex].id}` : undefined}
        />
        <kbd className="badge" style={{ flexShrink: 0 }}>Esc</kbd>
      </div>

      <p className="tiny dim" style={{ margin: '14px 0 8px' }}>
        {query.trim() ? 'Результаты' : 'Быстрые ссылки'}
      </p>

      <div
        id="command-results"
        ref={listRef}
        role="listbox"
        aria-label="Результаты поиска"
        style={{ maxHeight: '44vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        {items.length === 0 ? (
          <p className="small muted" style={{ padding: '12px 4px' }}>Ничего не найдено</p>
        ) : (
          items.map((item, index) => {
            const active = index === safeIndex;
            return (
              <button
                key={item.id}
                id={`cmd-${item.id}`}
                type="button"
                role="option"
                aria-selected={active}
                data-active={active}
                className="command-item"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(item)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '11px 12px',
                  borderRadius: 10,
                  border: '1px solid',
                  borderColor: active ? 'var(--border-accent)' : 'transparent',
                  background: active ? 'rgba(var(--accent-rgb), .08)' : 'transparent',
                  color: 'var(--text)',
                  textAlign: 'left',
                }}
              >
                <span className="flex gap-2" style={{ minWidth: 0 }}>
                  {item.type === 'Товар'
                    ? <Package size={16} className="text-accent" style={{ flexShrink: 0 }} aria-hidden="true" />
                    : <Compass size={16} className="text-accent" style={{ flexShrink: 0 }} aria-hidden="true" />}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                </span>
                <span className="flex gap-2" style={{ flexShrink: 0 }}>
                  {item.price != null && <span className="small text-accent">{item.price} ₽</span>}
                  <span className="tiny dim">{item.type}</span>
                  {active && <CornerDownLeft size={14} className="text-accent" aria-hidden="true" />}
                </span>
              </button>
            );
          })
        )}
      </div>

      {loadError && (
        <p className="tiny dim" style={{ marginTop: 10 }}>Не удалось загрузить товары — показаны быстрые ссылки.</p>
      )}
      <p className="tiny dim" style={{ marginTop: 12 }}>↑↓ — выбор · Enter — перейти · Esc — закрыть</p>
    </Modal>
  );
}

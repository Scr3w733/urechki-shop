import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeftRight, Heart, HeartOff, LogIn, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import AuthModal from '../components/AuthModal';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { formatPrice, productImage } from '../utils/product';
import { addFavorite, getCatalogProducts, getFavorites, removeFavorite, syncFavorites } from '../services/platformApi';

const LOCAL_KEY = 'urechki_favorites';

const asArray = (payload, keys) => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    for (const key of keys) if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
};

const toId = (item) => {
  if (item === null || item === undefined) return null;
  if (typeof item !== 'object') return String(item);
  const id = item.productId ?? item.id ?? item.product?.id;
  return id === null || id === undefined ? null : String(id);
};

const normalizeIds = (payload) => [...new Set(asArray(payload, ['favorites', 'productIds', 'items', 'ids']).map(toId).filter(Boolean))];

const readLocalIds = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? normalizeIds(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
};

const writeLocalIds = (ids) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
  } catch {
    // Приватный режим браузера может запретить запись — молча продолжаем без кеша.
  }
};

export default function Favorites() {
  const { user, getWishlist } = useAuth();
  const { addNotification } = useNotification();
  const [authOpen, setAuthOpen] = useState(false);

  const [ids, setIds] = useState(readLocalIds);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    let nextIds = readLocalIds();

    if (user?.id) {
      try {
        nextIds = normalizeIds(await getFavorites(user.id));
      } catch (err) {
        setError(err.message || 'Не удалось загрузить избранное с сервера.');
        addNotification(err.message || 'Не удалось загрузить избранное.', 'error');
      }
    }

    try {
      const payload = await getCatalogProducts();
      const products = asArray(payload, ['products', 'items']);
      setCatalog(products);
    } catch (err) {
      setCatalog([]);
      const message = err.message || 'Не удалось загрузить каталог товаров.';
      setError((prev) => prev || message);
      addNotification(message, 'error');
    }

    setIds(nextIds);
    setLoading(false);
  }, [user, addNotification]);

  useEffect(() => { load(); }, [load]);

  const savedProducts = useMemo(() => {
    const idSet = new Set(ids);
    return catalog.filter((product) => idSet.has(String(product.id)));
  }, [catalog, ids]);

  const suggestions = useMemo(() => {
    const idSet = new Set(ids);
    return catalog.filter((product) => !idSet.has(String(product.id))).slice(0, 6);
  }, [catalog, ids]);

  const handleAdd = async (product) => {
    const id = String(product.id);
    if (ids.includes(id)) return;
    setBusyId(id);
    try {
      if (user?.id) {
        await addFavorite(user.id, id);
      } else {
        const next = [...readLocalIds(), id];
        writeLocalIds([...new Set(next)]);
      }
      setIds((prev) => [...new Set([...prev, id])]);
      addNotification('Товар добавлен в избранное', 'success');
    } catch (err) {
      addNotification(err.message || 'Не удалось добавить товар в избранное.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (product) => {
    const id = String(product.id);
    setBusyId(id);
    try {
      if (user?.id) {
        await removeFavorite(user.id, id);
      } else {
        writeLocalIds(readLocalIds().filter((item) => item !== id));
      }
      setIds((prev) => prev.filter((item) => item !== id));
      addNotification('Товар убран из избранного', 'success');
    } catch (err) {
      addNotification(err.message || 'Не удалось убрать товар из избранного.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleSync = async () => {
    if (!user?.id) {
      addNotification('Войдите в аккаунт, чтобы синхронизировать избранное.', 'info');
      setAuthOpen(true);
      return;
    }
    const wishlistIds = (getWishlist() || []).map((product) => String(product.id));
    const merged = [...new Set([...ids, ...readLocalIds(), ...wishlistIds])];
    setSyncing(true);
    try {
      await syncFavorites(user.id, merged);
      writeLocalIds(merged);
      setIds(merged);
      addNotification(`Синхронизировано товаров: ${merged.length}.`, 'success');
    } catch (err) {
      addNotification(err.message || 'Не удалось синхронизировать избранное.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="container section">
      <div className="section-head flex between wrap gap-2">
        <div>
          <span className="eyebrow">Избранное</span>
          <h1>Сохранённые товары</h1>
          <p className="muted">
            {user
              ? 'Список хранится на сервере и привязан к вашему аккаунту. Кнопка «Синхронизировать» переносит локальный список в сервис.'
              : 'Вы не вошли в аккаунт — список хранится только в этом браузере (localStorage: urechki_favorites). После входа нажмите «Синхронизировать», чтобы перенести его на сервер.'}
          </p>
        </div>
        <div className="flex gap-2 wrap">
          <button className="btn btn-outline" onClick={load} disabled={loading}>
            <RefreshCw size={16} /> Обновить
          </button>
          <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
            {syncing ? <><span className="spinner" /> Синхронизируем…</> : <><ArrowLeftRight size={16} /> Синхронизировать</>}
          </button>
        </div>
      </div>

      {!user && (
        <div className="card flex between wrap gap-2" style={{ marginBottom: 24, borderColor: 'var(--border-accent)' }}>
          <div>
            <strong>Гостевой режим</strong>
            <p className="muted small" style={{ marginTop: 4 }}>
              Изменения сохраняются локально и не видны на других устройствах, пока вы не войдёте и не синхронизируете список.
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setAuthOpen(true)}>
            <LogIn size={16} /> Войти и синхронизировать
          </button>
        </div>
      )}

      {error && (
        <div className="card" role="alert" style={{ borderColor: 'var(--danger)', marginBottom: 24 }}>
          <span className="form-error flex gap-2"><AlertTriangle size={16} /> {error}</span>
        </div>
      )}

      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : savedProducts.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Heart size={46} />}
            title="В избранном пока пусто"
            description="Добавьте товары из каталога ниже — здесь появится сетка сохранённых позиций."
          />
        </div>
      ) : (
        <div className="grid grid-4" style={{ marginBottom: 36 }}>
          {savedProducts.map((product) => (
            <div className="stack" key={product.id}>
              <ProductCard product={product} />
              <button
                className="btn btn-ghost btn-sm btn-block"
                onClick={() => handleRemove(product)}
                disabled={busyId === String(product.id)}
              >
                <HeartOff size={16} /> Убрать из избранного
              </button>
            </div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <section>
          <div className="section-head">
            <h2 style={{ fontSize: '1.6rem' }}>Добавить из каталога</h2>
            <p className="muted small">Товары, которых ещё нет в вашем списке.</p>
          </div>
          <div className="grid grid-3">
            {suggestions.map((product) => (
              <div key={product.id} className="card flex gap-2">
                <img
                  src={productImage(product)}
                  alt=""
                  style={{ width: 62, height: 62, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
                />
                <div className="stack" style={{ gap: 4, flex: 1, minWidth: 0 }}>
                  <strong className="small">{product.name}</strong>
                  <span className="text-accent bold small">{formatPrice(product.price)}</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleAdd(product)}
                    disabled={busyId === String(product.id)}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <Plus size={15} /> Добавить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

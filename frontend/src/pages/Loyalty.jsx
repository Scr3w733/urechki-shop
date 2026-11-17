import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  Gift,
  History,
  LogIn,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import AuthModal from '../components/AuthModal';
import EmptyState from '../components/EmptyState';
import { LineSkeleton } from '../components/Skeleton';
import { formatPrice } from '../utils/product';
import { getLoyaltyAccount, getLoyaltyHistory, quoteLoyalty } from '../services/platformApi';

const dateOptions = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };

const formatDate = (value) => {
  if (!value) return '—';
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day, hours = 0, minutes = 0] = value;
    const date = new Date(year, month - 1, day, hours, minutes);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString('ru-RU', dateOptions);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('ru-RU', dateOptions);
};

const numberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const labelOf = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'object') return value.name ?? value.title ?? value.label ?? null;
  return String(value);
};

const asArray = (payload, keys) => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    for (const key of keys) {
      if (Array.isArray(payload[key])) return payload[key];
    }
  }
  return [];
};

// Сервис может вернуть как сам счёт, так и обёртку { account: {...} }.
const normalizeAccount = (payload) => {
  if (!payload || typeof payload !== 'object') return null;
  const account = payload.account && typeof payload.account === 'object' ? payload.account : payload;

  const points = numberOrNull(account.points ?? account.balance ?? account.bonusPoints ?? account.currentPoints);
  const level = labelOf(account.level ?? account.tier ?? account.levelName);
  const nextLevel = labelOf(account.nextLevel ?? account.nextLevelName ?? account.nextTier);
  const pointsToNext = numberOrNull(
    account.pointsToNext ?? account.pointsToNextLevel ?? account.remainingPoints,
  );
  const threshold = numberOrNull(
    account.nextLevelThreshold ?? account.nextLevelRequired ?? account.threshold,
  );
  const rawProgress = numberOrNull(account.progressPercent ?? account.progress);

  let progressPercent = null;
  if (rawProgress !== null) {
    progressPercent = rawProgress >= 0 && rawProgress <= 1 ? rawProgress * 100 : rawProgress;
  } else if (threshold !== null && points !== null && threshold > 0) {
    progressPercent = (points / threshold) * 100;
  } else if (pointsToNext !== null && points !== null && points + pointsToNext > 0) {
    progressPercent = (points / (points + pointsToNext)) * 100;
  }
  if (progressPercent !== null) progressPercent = Math.max(0, Math.min(100, progressPercent));

  return { points, level, nextLevel, pointsToNext, threshold, progressPercent, raw: account };
};

const normalizeHistory = (payload) => asArray(payload, ['transactions', 'history', 'events', 'items']).map((entry, index) => ({
  id: entry?.id ?? entry?.transactionId ?? `${index}-${entry?.createdAt ?? index}`,
  date: entry?.createdAt ?? entry?.date ?? entry?.timestamp ?? entry?.time ?? null,
  type: entry?.type ?? entry?.operation ?? entry?.kind ?? 'Операция',
  points: numberOrNull(entry?.points ?? entry?.delta ?? entry?.bonusPoints ?? entry?.amount),
  orderAmount: numberOrNull(entry?.orderAmount ?? entry?.purchaseAmount ?? entry?.amount),
  description: entry?.description ?? entry?.reason ?? entry?.comment ?? entry?.orderId ?? '',
}));

const normalizeQuote = (payload) => {
  const quote = payload?.quote && typeof payload.quote === 'object' ? payload.quote : payload;
  if (!quote || typeof quote !== 'object') return null;
  return {
    cashback: numberOrNull(quote.cashback ?? quote.cashbackAmount ?? quote.cashbackValue ?? quote.discount ?? quote.bonus),
    points: numberOrNull(quote.earnedPoints ?? quote.points ?? quote.bonusPoints ?? quote.accruedPoints),
    rate: numberOrNull(quote.rate ?? quote.cashbackRate ?? quote.percent),
    level: labelOf(quote.level ?? quote.tier),
    raw: payload,
  };
};

export default function Loyalty() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [authOpen, setAuthOpen] = useState(false);

  const [account, setAccount] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  const customerId = user?.id;

  const loadData = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError('');
    const [accountResult, historyResult] = await Promise.allSettled([
      getLoyaltyAccount(customerId),
      getLoyaltyHistory(customerId),
    ]);

    if (accountResult.status === 'fulfilled') {
      setAccount(normalizeAccount(accountResult.value));
    } else {
      setAccount(null);
      setError(accountResult.reason?.message || 'Не удалось загрузить данные программы лояльности.');
      addNotification(accountResult.reason?.message || 'Не удалось загрузить уровень лояльности.', 'error');
    }

    if (historyResult.status === 'fulfilled') {
      setHistory(normalizeHistory(historyResult.value));
    } else {
      setHistory([]);
      const message = historyResult.reason?.message || 'Не удалось загрузить историю операций.';
      setError((prev) => prev || message);
      addNotification(message, 'error');
    }
    setLoading(false);
  }, [customerId, addNotification]);

  useEffect(() => {
    if (!customerId) {
      setAccount(null);
      setHistory([]);
      setQuote(null);
      return;
    }
    loadData();
  }, [customerId, loadData]);

  const handleQuote = async (event) => {
    event.preventDefault();
    const value = numberOrNull(amount);
    if (value === null || value <= 0) {
      setQuoteError('Введите сумму покупки больше нуля.');
      return;
    }
    setQuoting(true);
    setQuoteError('');
    setQuote(null);
    try {
      const payload = await quoteLoyalty({ customerId, amount: value });
      setQuote(normalizeQuote(payload));
    } catch (err) {
      setQuoteError(err.message || 'Не удалось рассчитать кэшбэк.');
      addNotification(err.message || 'Не удалось рассчитать кэшбэк.', 'error');
    } finally {
      setQuoting(false);
    }
  };

  return (
    <div className="container section">
      <div className="section-head">
        <span className="eyebrow">Лояльность</span>
        <h1>Ваши бонусы и уровень</h1>
        <p className="muted">
          Данные берутся из сервиса лояльности: текущий уровень, баланс баллов, прогресс
          до следующего уровня, расчёт кэшбэка и история начислений.
        </p>
      </div>

      {!user ? (
        <div className="card">
          <EmptyState
            icon={<Gift size={46} />}
            title="Войдите, чтобы увидеть свои бонусы"
            description="Уровень, баллы и история операций привязаны к вашему аккаунту. Данные гостя сервис не хранит."
            action={
              <button className="btn btn-primary" onClick={() => setAuthOpen(true)}>
                <LogIn size={17} /> Войти в аккаунт
              </button>
            }
          />
        </div>
      ) : (
        <>
          {error && (
            <div className="card" role="alert" style={{ borderColor: 'var(--danger)', marginBottom: 24 }}>
              <div className="flex gap-2">
                <AlertTriangle size={20} color="#fca5a5" />
                <span>{error}</span>
                <button className="btn btn-ghost btn-sm" onClick={loadData} style={{ marginLeft: 'auto' }}>
                  <RefreshCw size={15} /> Повторить
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-2" style={{ marginBottom: 24 }}>
            <section className="card">
              <div className="flex between gap-2" style={{ marginBottom: 20 }}>
                <h3 className="flex gap-2"><Sparkles size={20} className="text-accent" /> Уровень и баллы</h3>
                <button className="icon-btn" onClick={loadData} disabled={loading} title="Обновить" aria-label="Обновить">
                  <RefreshCw size={16} />
                </button>
              </div>

              {loading && !account ? (
                <div className="stack">
                  <LineSkeleton width="45%" height={34} />
                  <LineSkeleton width="70%" height={16} />
                  <LineSkeleton width="100%" height={10} />
                </div>
              ) : !account ? (
                <p className="muted">Данные аккаунта лояльности пока недоступны.</p>
              ) : (
                <div className="stack">
                  <div className="flex between wrap gap-2">
                    <div>
                      <span className="muted small bold uppercase">Текущий уровень</span>
                      <div style={{ fontSize: '1.6rem', marginTop: 4 }}>
                        {account.level ? String(account.level) : 'Не указан'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="muted small bold uppercase">Баллы</span>
                      <div className="text-accent" style={{ fontSize: '2rem', fontWeight: 800, marginTop: 4 }}>
                        {account.points !== null ? account.points.toLocaleString('ru-RU') : '—'}
                      </div>
                    </div>
                  </div>

                  {account.progressPercent !== null ? (
                    <div>
                      <div className="flex between small muted" style={{ marginBottom: 8 }}>
                        <span>До уровня {account.nextLevel ? String(account.nextLevel) : 'следующего'}</span>
                        <span>{Math.round(account.progressPercent)}%</span>
                      </div>
                      <div className="progress-track" style={{ marginTop: 0 }}>
                        <div className="progress-fill" style={{ width: `${account.progressPercent}%` }} />
                      </div>
                      {account.pointsToNext !== null && (
                        <p className="tiny muted" style={{ marginTop: 8 }}>
                          Осталось баллов: {account.pointsToNext.toLocaleString('ru-RU')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="muted small">
                      Информация о следующем уровне от сервиса не поступила — прогресс не показываем.
                    </p>
                  )}
                </div>
              )}
            </section>

            <section className="card">
              <h3 className="flex gap-2" style={{ marginBottom: 6 }}>
                <Calculator size={20} className="text-accent" /> Расчёт кэшбэка
              </h3>
              <p className="muted small" style={{ marginBottom: 18 }}>
                Укажите сумму покупки — сервис рассчитает выгоду по вашему уровню.
              </p>
              <form className="stack" onSubmit={handleQuote}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="loyalty-amount">Сумма покупки, ₽</label>
                  <input
                    id="loyalty-amount"
                    className="input"
                    type="number"
                    min="1"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="Например, 2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" type="submit" disabled={quoting}>
                  {quoting ? <><span className="spinner" /> Рассчитываем…</> : <><TrendingUp size={17} /> Рассчитать</>}
                </button>
              </form>

              {quoteError && <p className="form-error" style={{ marginTop: 12 }}>{quoteError}</p>}

              {quote && (
                <div className="glass-panel" style={{ padding: 18, marginTop: 18 }}>
                  {quote.cashback !== null ? (
                    <>
                      <span className="muted small bold uppercase">Кэшбэк</span>
                      <div className="text-accent" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                        {formatPrice(quote.cashback)}
                      </div>
                    </>
                  ) : (
                    <p className="muted small">Сервис вернул расчёт, но не указал сумму кэшбэка.</p>
                  )}
                  <div className="flex wrap gap-2" style={{ marginTop: 12 }}>
                    {quote.points !== null && <span className="badge badge-accent">Баллов: {quote.points.toLocaleString('ru-RU')}</span>}
                    {quote.rate !== null && <span className="badge">Ставка: {quote.rate}</span>}
                    {quote.level && <span className="badge badge-success">Уровень: {String(quote.level)}</span>}
                  </div>
                </div>
              )}
            </section>
          </div>

          <section className="card">
            <h3 className="flex gap-2" style={{ marginBottom: 20 }}>
              <History size={20} className="text-accent" /> История операций
            </h3>
            {loading && history.length === 0 ? (
              <div className="stack">
                <LineSkeleton height={18} />
                <LineSkeleton height={18} width="80%" />
                <LineSkeleton height={18} width="60%" />
              </div>
            ) : history.length === 0 ? (
              <EmptyState
                title="Операций пока нет"
                description="Как только сервис начислит или спишет баллы, операции появятся здесь."
              />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Операция</th>
                      <th>Описание</th>
                      <th className="text-right">Баллы</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry) => (
                      <tr key={entry.id}>
                        <td className="muted small">{formatDate(entry.date)}</td>
                        <td><span className="badge">{String(entry.type)}</span></td>
                        <td className="muted">{entry.description || '—'}</td>
                        <td className="text-right bold text-accent">
                          {entry.points !== null
                            ? `${entry.points > 0 ? '+' : ''}${entry.points.toLocaleString('ru-RU')}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

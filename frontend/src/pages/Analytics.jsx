import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  DollarSign,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { LineSkeleton } from '../components/Skeleton';
import { formatPrice } from '../utils/product';
import { getAnalyticsFunnel, getAnalyticsRecent, getAnalyticsSummary } from '../services/platformApi';

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

const pickNumber = (source, keys) => {
  if (!source || typeof source !== 'object') return null;
  for (const key of keys) {
    const value = numberOrNull(source[key]);
    if (value !== null) return value;
  }
  return null;
};

const asArray = (payload, keys) => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    for (const key of keys) if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
};

const normalizeSummary = (payload) => {
  const data = payload?.summary && typeof payload.summary === 'object' ? payload.summary : payload;
  if (!data || typeof data !== 'object') return null;
  return {
    events: pickNumber(data, ['events', 'totalEvents', 'eventsCount', 'count']),
    revenue: pickNumber(data, ['revenue', 'totalRevenue', 'revenueTotal', 'amount']),
    customers: pickNumber(data, ['uniqueCustomers', 'customers', 'uniqueUsers', 'users']),
    last24h: pickNumber(data, ['last24h', 'last24Hours', 'eventsLast24h', 'lastDayEvents', 'recent24h']),
  };
};

const normalizeFunnel = (payload) => {
  const raw = asArray(payload, ['funnel', 'stages', 'steps', 'items']);
  if (raw.length) {
    return raw.map((item) => ({
      stage: item?.stage ?? item?.name ?? item?.label ?? item?.step ?? 'Этап',
      value: pickNumber(item, ['count', 'value', 'users', 'visits', 'amount', 'total']),
    })).filter((item) => item.value !== null);
  }
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return Object.entries(payload)
      .map(([stage, value]) => ({ stage, value: numberOrNull(value) ?? pickNumber(value, ['count', 'value', 'users']) }))
      .filter((item) => item.value !== null);
  }
  return [];
};

const normalizeRecent = (payload) => asArray(payload, ['events', 'items', 'data', 'recent']).map((event, index) => ({
  id: event?.id ?? event?.eventId ?? `${index}-${event?.createdAt ?? index}`,
  date: event?.createdAt ?? event?.timestamp ?? event?.date ?? event?.time ?? null,
  type: event?.type ?? event?.event ?? event?.name ?? 'Событие',
  customer: event?.customerId ?? event?.userId ?? event?.customer?.id ?? event?.email ?? null,
  details: event?.details ?? event?.description ?? event?.page ?? event?.path ?? event?.label ?? '',
  value: pickNumber(event, ['revenue', 'value', 'amount', 'total']),
}));

const displayNumber = (value) => (value === null || value === undefined ? '—' : value.toLocaleString('ru-RU'));

export default function Analytics() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [summary, setSummary] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const isOwner = user?.role === 'Владелец';

  const load = useCallback(async () => {
    if (!isOwner) return;
    setLoading(true);
    setErrors([]);
    const [summaryResult, funnelResult, recentResult] = await Promise.allSettled([
      getAnalyticsSummary(),
      getAnalyticsFunnel(),
      getAnalyticsRecent(20),
    ]);

    const problems = [];
    if (summaryResult.status === 'fulfilled') setSummary(normalizeSummary(summaryResult.value));
    else {
      setSummary(null);
      problems.push(summaryResult.reason?.message || 'Не удалось загрузить сводку.');
    }

    if (funnelResult.status === 'fulfilled') setFunnel(normalizeFunnel(funnelResult.value));
    else {
      setFunnel([]);
      problems.push(funnelResult.reason?.message || 'Не удалось загрузить воронку.');
    }

    if (recentResult.status === 'fulfilled') setRecent(normalizeRecent(recentResult.value));
    else {
      setRecent([]);
      problems.push(recentResult.reason?.message || 'Не удалось загрузить события.');
    }

    setErrors(problems);
    if (problems.length) addNotification(problems[0], 'error');
    setLoading(false);
  }, [isOwner, addNotification]);

  useEffect(() => { load(); }, [load]);

  if (!isOwner) {
    return (
      <div className="container section">
        <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="empty-state">
            <ShieldAlert size={46} />
            <h3 style={{ margin: '12px 0 8px' }}>Доступ только для владельца</h3>
            <p style={{ maxWidth: 420, margin: '0 auto 20px' }}>
              Раздел аналитики показывает данные платформы и доступен только пользователю с ролью «Владелец».
            </p>
            <Link to="/" className="btn btn-primary">На главную</Link>
          </div>
        </div>
      </div>
    );
  }

  const funnelBase = funnel.length ? funnel[0].value : 0;
  const funnelMax = Math.max(1, ...funnel.map((item) => item.value));

  const cards = [
    { label: 'Всего событий', value: summary ? displayNumber(summary.events) : '—', icon: Activity },
    { label: 'Выручка', value: summary && summary.revenue !== null ? formatPrice(summary.revenue) : '—', icon: DollarSign },
    { label: 'Уникальные клиенты', value: summary ? displayNumber(summary.customers) : '—', icon: Users },
    { label: 'События за 24 часа', value: summary ? displayNumber(summary.last24h) : '—', icon: Clock },
  ];

  return (
    <div className="container section">
      <div className="section-head flex between wrap gap-2">
        <div>
          <span className="eyebrow">Аналитика</span>
          <h1>Показатели платформы</h1>
          <p className="muted">Данные приходят из сервиса аналитики. Отсутствующие показатели не подменяются заглушками.</p>
        </div>
        <button className="btn btn-outline" onClick={load} disabled={loading}>
          {loading ? <><span className="spinner" /> Обновляем…</> : <><RefreshCw size={16} /> Обновить</>}
        </button>
      </div>

      {errors.length > 0 && (
        <div className="card" role="alert" style={{ borderColor: 'var(--danger)', marginBottom: 24 }}>
          <div className="flex gap-2"><AlertTriangle size={18} color="#fca5a5" /><span>{errors.join(' ')}</span></div>
        </div>
      )}

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {cards.map(({ label, value, icon: Icon }) => (
          <div className="card" key={label}>
            <div className="flex gap-2 muted small uppercase"><Icon size={16} className="text-accent" /> {label}</div>
            {loading && !summary ? (
              <div style={{ marginTop: 14 }}><LineSkeleton width="70%" height={30} /></div>
            ) : (
              <div style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: 12 }}>{value}</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <section className="card">
          <h3 className="flex gap-2" style={{ marginBottom: 20 }}><TrendingUp size={20} className="text-accent" /> Воронка событий</h3>
          {loading && funnel.length === 0 ? (
            <div className="stack">
              <LineSkeleton height={18} />
              <LineSkeleton height={18} width="85%" />
              <LineSkeleton height={18} width="65%" />
            </div>
          ) : funnel.length === 0 ? (
            <p className="muted">Сервис не вернул данные воронки.</p>
          ) : (
            <div className="stack">
              {funnel.map((item, index) => {
                const conversion = funnelBase > 0 ? (item.value / funnelBase) * 100 : null;
                return (
                  <div key={`${item.stage}-${index}`}>
                    <div className="flex between small" style={{ marginBottom: 6 }}>
                      <span className="bold">{String(item.stage)}</span>
                      <span className="muted">
                        {item.value.toLocaleString('ru-RU')}{conversion !== null ? ` · ${Math.round(conversion)}%` : ''}
                      </span>
                    </div>
                    <div className="progress-track" style={{ marginTop: 0 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min(100, (item.value / funnelMax) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="card">
          <h3 className="flex gap-2" style={{ marginBottom: 20 }}><BarChart3 size={20} className="text-accent" /> Последние события</h3>
          {loading && recent.length === 0 ? (
            <div className="stack">
              <LineSkeleton height={16} />
              <LineSkeleton height={16} width="90%" />
              <LineSkeleton height={16} width="75%" />
            </div>
          ) : recent.length === 0 ? (
            <p className="muted">Событий пока нет или сервис вернул пустой список.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Время</th><th>Событие</th><th>Клиент</th><th>Детали</th><th className="text-right">Значение</th></tr>
                </thead>
                <tbody>
                  {recent.map((event) => (
                    <tr key={event.id}>
                      <td className="muted small">{formatDate(event.date)}</td>
                      <td><span className="badge badge-accent">{String(event.type)}</span></td>
                      <td className="muted small">{event.customer ?? '—'}</td>
                      <td className="muted small">{event.details || '—'}</td>
                      <td className="text-right bold text-accent">{event.value !== null ? event.value.toLocaleString('ru-RU') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Server,
  XCircle,
} from 'lucide-react';
import { checkPlatformServices } from '../services/platformApi';

const detailFields = ['products', 'customers', 'orders', 'events', 'services'];

function serviceDetail(data) {
  if (!data || typeof data !== 'object') return '';
  const parts = detailFields
    .filter((field) => data[field] !== undefined && data[field] !== null)
    .map((field) => `${field}: ${data[field]}`);
  if (parts.length) return parts.join(' · ');
  return data.message || data.service || '';
}

export default function SystemStatus() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState(null);

  const check = useCallback(async () => {
    setLoading(true);
    const result = await checkPlatformServices();
    setServices(result);
    setCheckedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { check(); }, [check]);

  const online = services.filter((item) => item.online).length;
  const offline = services.length - online;
  const average = services.length
    ? Math.round(services.reduce((sum, item) => sum + item.latency, 0) / services.length)
    : 0;

  const stats = [
    { label: 'Всего сервисов', value: services.length || '—', icon: Server },
    { label: 'Работают', value: services.length ? online : '—', icon: CheckCircle2 },
    { label: 'Недоступны', value: services.length ? offline : '—', icon: XCircle },
    { label: 'Средний отклик', value: services.length ? `${average} мс` : '—', icon: Clock3 },
  ];

  return (
    <div className="container section">
      <div className="section-head flex between wrap gap-2">
        <div>
          <span className="eyebrow">Платформа</span>
          <h1>Состояние сервисов</h1>
          <p className="muted">
            Каждая карточка — реальный запрос к health-эндпоинту микросервиса через общий nginx.
            Данные не кэшируются и не подменяются заглушками.
          </p>
        </div>
        <button className="btn btn-outline" onClick={check} disabled={loading}>
          {loading ? <><span className="spinner" /> Проверяем…</> : <><RefreshCw size={16} /> Проверить снова</>}
        </button>
      </div>

      {checkedAt && (
        <p className="muted small" style={{ marginTop: -8, marginBottom: 20 }}>
          Последняя проверка: {checkedAt.toLocaleTimeString('ru-RU')}
        </p>
      )}

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {stats.map(({ label, value, icon: Icon }) => (
          <div className="card" key={label}>
            <div className="flex gap-2 muted small uppercase"><Icon size={16} className="text-accent" /> {label}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: 12 }}>{value}</div>
          </div>
        ))}
      </div>

      {offline > 0 && (
        <div className="card" role="alert" style={{ borderColor: 'var(--danger)', marginBottom: 24 }}>
          <div className="flex gap-2">
            <AlertTriangle size={18} color="#fca5a5" />
            <span>
              Недоступно сервисов: {offline}. Остальные разделы сайта продолжают работать —
              микросервисы изолированы, поэтому отказ одного не роняет платформу.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        {services.map((service) => (
          <div className="card" key={service.id}>
            <div className="flex between gap-2">
              <h3 className="flex gap-2" style={{ margin: 0 }}>
                <Activity size={18} className="text-accent" /> {service.name}
              </h3>
              <span className={`badge ${service.online ? 'badge-success' : 'badge-danger'}`}>
                {service.online ? 'В сети' : 'Недоступен'}
              </span>
            </div>
            <p className="muted small" style={{ margin: '12px 0 8px' }}>{service.description}</p>
            <div className="flex between small muted">
              <code>{service.path}</code>
              <span>{service.latency} мс</span>
            </div>
            {service.online && serviceDetail(service.data) && (
              <p className="small text-accent" style={{ marginBottom: 0 }}>{serviceDetail(service.data)}</p>
            )}
            {!service.online && <p className="small" style={{ color: '#fca5a5', marginBottom: 0 }}>{service.error}</p>}
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 className="flex gap-2"><Server size={20} className="text-accent" /> Как это устроено</h3>
        <p className="muted" style={{ marginBottom: 0 }}>
          nginx принимает запросы на порту 80 и по префиксу <code>/api/...</code> передаёт их нужному
          контейнеру во внутренней сети Docker. Health-эндпоинты используются и для автоматических
          проверок Docker (<code>docker compose ps</code>), и для этой страницы. Если сервис не отвечает,
          карточка показывает ошибку, а не выдуманное «всё хорошо».
        </p>
      </div>
    </div>
  );
}

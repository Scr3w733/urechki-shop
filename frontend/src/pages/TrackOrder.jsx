import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  Check,
  Clock,
  LogIn,
  MapPin,
  Navigation,
  PackageSearch,
  Plus,
  RefreshCw,
  Search,
  Send,
  Truck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import AuthModal from '../components/AuthModal';
import EmptyState from '../components/EmptyState';
import { LineSkeleton } from '../components/Skeleton';
import { createShipment, getCustomerShipments, getShipment, updateShipmentStatus } from '../services/platformApi';

const STATUS_STEPS = ['Создано', 'Передано в доставку', 'В пути', 'Доставлен'];

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

const asArray = (payload, keys) => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    for (const key of keys) if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
};

const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase();

const stageIndex = (status) => {
  const value = normalizeStatus(status);
  if (!value) return -1;
  let index = STATUS_STEPS.findIndex((step) => normalizeStatus(step) === value);
  if (index !== -1) return index;
  index = STATUS_STEPS.findIndex((step) => value.includes(normalizeStatus(step)) || normalizeStatus(step).includes(value));
  if (index !== -1) return index;
  if (/доставл|получ|выдан|заверш/.test(value)) return STATUS_STEPS.findIndex((s) => /доставл/.test(normalizeStatus(s)));
  if (/пути|транзит|отправл|переда/.test(value)) return STATUS_STEPS.findIndex((s) => /пути|переда/.test(normalizeStatus(s)));
  return -1;
};

const normalizeEvents = (payload) => asArray(payload, ['events', 'history', 'timeline', 'items']).map((event, index) => ({
  id: event?.id ?? event?.eventId ?? `${index}-${event?.createdAt ?? index}`,
  date: event?.createdAt ?? event?.date ?? event?.timestamp ?? event?.time ?? null,
  status: event?.status ?? event?.state ?? null,
  note: event?.note ?? event?.description ?? event?.comment ?? '',
  location: event?.location ?? event?.city ?? null,
}));

const normalizeShipment = (payload) => {
  const shipment = payload?.shipment && typeof payload.shipment === 'object' ? payload.shipment : payload;
  if (!shipment || typeof shipment !== 'object') return null;
  return {
    id: shipment.id ?? shipment.shipmentId ?? null,
    orderId: shipment.orderId ?? shipment.order?.id ?? null,
    status: shipment.status ?? shipment.currentStatus ?? null,
    address: shipment.address ?? shipment.deliveryAddress ?? null,
    createdAt: shipment.createdAt ?? shipment.created ?? null,
    updatedAt: shipment.updatedAt ?? null,
    events: normalizeEvents(shipment.events ?? shipment.history ?? shipment.timeline ?? payload?.events ?? payload?.history),
    raw: shipment,
  };
};

const normalizeOrders = (payload) => asArray(payload, ['orders', 'items', 'data']).map((order) => ({
  id: order?.id ?? order?.orderId ?? null,
  status: order?.status ?? null,
  date: order?.createdAt ?? order?.date ?? null,
  address: order?.address ?? order?.deliveryAddress ?? order?.shippingAddress ?? '',
  total: order?.total ?? order?.totalAmount ?? null,
}));

export default function TrackOrder() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [authOpen, setAuthOpen] = useState(false);

  const [orders, setOrders] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [helperError, setHelperError] = useState('');

  const [orderId, setOrderId] = useState('');
  const [address, setAddress] = useState('');
  const [shipment, setShipment] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const [statusForm, setStatusForm] = useState({ status: '', note: '', location: '' });
  const isOwner = user?.role === 'Владелец';

  const loadHelpers = useCallback(async () => {
    if (!user?.id) return;
    setHelperError('');
    const [ordersResult, shipmentsResult] = await Promise.allSettled([
      axios.get(`/api/orders/customer/${encodeURIComponent(user.id)}`),
      getCustomerShipments(user.id),
    ]);

    if (ordersResult.status === 'fulfilled') {
      setOrders(normalizeOrders(ordersResult.value.data));
    } else {
      setOrders([]);
      setHelperError('Не удалось загрузить ваши заказы. Вы можете указать номер заказа вручную.');
    }

    if (shipmentsResult.status === 'fulfilled') {
      setShipments(asArray(shipmentsResult.value, ['shipments', 'items', 'data']).map(normalizeShipment).filter(Boolean));
    } else {
      setShipments([]);
    }
  }, [user]);

  useEffect(() => {
    setShipment(null);
    setError('');
    if (user?.id) loadHelpers();
    else {
      setOrders([]);
      setShipments([]);
      setHelperError('');
    }
  }, [user?.id, loadHelpers]);

  useEffect(() => {
    if (shipment?.status) {
      setStatusForm((prev) => ({ ...prev, status: prev.status || String(shipment.status) }));
    }
  }, [shipment?.status]);

  const handleLoad = async (event) => {
    event?.preventDefault();
    const id = orderId.trim();
    if (!id) {
      setError('Укажите номер заказа.');
      return;
    }
    setBusy('load');
    setError('');
    try {
      const payload = await getShipment(id);
      const next = normalizeShipment(payload);
      if (!next) throw new Error('Сервис вернул пустые данные отправления.');
      setShipment(next);
      if (next.address && !address.trim()) setAddress(next.address);
      addNotification('Отправление загружено.', 'success');
    } catch (err) {
      setShipment(null);
      setError(err.message || 'Не удалось загрузить отправление.');
      addNotification(err.message || 'Не удалось загрузить отправление.', 'error');
    } finally {
      setBusy('');
    }
  };

  const handleCreate = async () => {
    const id = orderId.trim();
    if (!id) {
      setError('Укажите номер заказа.');
      return;
    }
    if (!address.trim()) {
      setError('Укажите адрес доставки.');
      return;
    }
    setBusy('create');
    setError('');
    try {
      const payload = await createShipment({ orderId: id, customerId: user?.id ?? null, address: address.trim() });
      const next = normalizeShipment(payload);
      if (!next) throw new Error('Сервис не вернул данные созданного отправления.');
      setShipment(next);
      addNotification('Отправление создано.', 'success');
      if (user?.id) loadHelpers();
    } catch (err) {
      setError(err.message || 'Не удалось создать отправление.');
      addNotification(err.message || 'Не удалось создать отправление.', 'error');
    } finally {
      setBusy('');
    }
  };

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    if (!shipment?.orderId && !orderId.trim()) return;
    if (!statusForm.status.trim()) {
      setError('Выберите новый статус.');
      return;
    }
    setBusy('status');
    setError('');
    try {
      const payload = await updateShipmentStatus(shipment?.orderId ?? orderId.trim(), {
        status: statusForm.status.trim(),
        note: statusForm.note.trim() || undefined,
        location: statusForm.location.trim() || undefined,
      });
      setShipment(normalizeShipment(payload) ?? shipment);
      setStatusForm((prev) => ({ ...prev, note: '', location: '' }));
      addNotification('Статус отправления обновлён.', 'success');
      if (user?.id) loadHelpers();
    } catch (err) {
      setError(err.message || 'Не удалось обновить статус.');
      addNotification(err.message || 'Не удалось обновить статус.', 'error');
    } finally {
      setBusy('');
    }
  };

  const currentIndex = shipment ? stageIndex(shipment.status) : -1;
  const progress = currentIndex >= 0 && STATUS_STEPS.length > 1
    ? (currentIndex / (STATUS_STEPS.length - 1)) * 100
    : 0;
  const statusOptions = [...new Set([...STATUS_STEPS, shipment?.status].filter(Boolean))];

  return (
    <div className="container section">
      <div className="section-head">
        <span className="eyebrow">Доставка</span>
        <h1>Отследить заказ</h1>
        <p className="muted">
          Статусы и события приходят из сервиса отслеживания. Если отправления ещё нет —
          создайте его по номеру заказа и адресу доставки.
        </p>
      </div>

      {!user && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="flex between wrap gap-2">
            <div>
              <strong>Вошли в аккаунт?</strong>
              <p className="muted small" style={{ marginTop: 4 }}>
                Тогда ваши последние заказы и отправления подтянутся автоматически.
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setAuthOpen(true)}>
              <LogIn size={16} /> Войти
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <section className="card">
          <h3 className="flex gap-2" style={{ marginBottom: 18 }}><Search size={20} className="text-accent" /> Найти отправление</h3>
          <div className="stack">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="track-order-id">Номер заказа</label>
              <input
                id="track-order-id"
                className="input"
                type="text"
                placeholder="Например, 1042"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="track-address">Адрес доставки</label>
              <input
                id="track-address"
                className="input"
                type="text"
                placeholder="Улица, дом, город"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="flex wrap gap-2">
              <button className="btn btn-primary" onClick={handleLoad} disabled={Boolean(busy)}>
                {busy === 'load' ? <><span className="spinner" /> Ищем…</> : <><Search size={16} /> Загрузить</>}
              </button>
              <button className="btn btn-outline" onClick={handleCreate} disabled={Boolean(busy)}>
                {busy === 'create' ? <><span className="spinner" /> Создаём…</> : <><Plus size={16} /> Создать отправление</>}
              </button>
            </div>
          </div>

          {error && (
            <div className="card" role="alert" style={{ marginTop: 18, borderColor: 'var(--danger)' }}>
              <span className="form-error flex gap-2"><AlertTriangle size={16} /> {error}</span>
            </div>
          )}

          {(orders.length > 0 || helperError) && (
            <div style={{ marginTop: 20 }}>
              <h4 className="muted small uppercase">Ваши заказы</h4>
              {helperError && <p className="muted small">{helperError}</p>}
              <div className="flex wrap gap-2" style={{ marginTop: 10 }}>
                {orders.map((order, orderIndex) => (
                  <button
                    key={order.id ?? `order-${orderIndex}`}
                    type="button"
                    className="chip"
                    onClick={() => {
                      if (order.id != null) setOrderId(String(order.id));
                      if (order.address) setAddress(order.address);
                    }}
                    title={order.date ? formatDate(order.date) : undefined}
                  >
                    Заказ {order.id ?? '—'}{order.status ? ` · ${order.status}` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="card">
          <h3 className="flex gap-2" style={{ marginBottom: 18 }}><Truck size={20} className="text-accent" /> Статус доставки</h3>
          {!shipment ? (
            busy === 'load' ? (
              <div className="stack">
                <LineSkeleton height={28} width="60%" />
                <LineSkeleton height={12} />
                <LineSkeleton height={12} width="80%" />
              </div>
            ) : (
              <EmptyState
                icon={<PackageSearch size={46} />}
                title="Отправление не выбрано"
                description="Введите номер заказа и нажмите «Загрузить», либо создайте новое отправление."
              />
            )
          ) : (
            <div className="stack">
              <div className="flex between wrap gap-2">
                <div>
                  <span className="muted small bold uppercase">Заказ</span>
                  <div style={{ fontSize: '1.4rem' }}>{shipment.orderId ?? '—'}</div>
                </div>
                {shipment.status && <span className="badge badge-accent">{String(shipment.status)}</span>}
              </div>

              {shipment.address && (
                <p className="muted small flex gap-2"><MapPin size={15} /> {shipment.address}</p>
              )}

              {currentIndex >= 0 ? (
                <>
                  <div className="progress-track" style={{ marginTop: 4 }}>
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <ol className="stack" style={{ listStyle: 'none', padding: 0, margin: 0, gap: 14 }}>
                    {STATUS_STEPS.map((step, index) => {
                      const done = index <= currentIndex;
                      return (
                        <li key={step} className="flex gap-2" style={{ opacity: done ? 1 : 0.45 }}>
                          <span
                            style={{
                              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                              display: 'grid', placeItems: 'center',
                              background: done ? 'var(--accent)' : 'rgba(255,255,255,.07)',
                              color: done ? 'var(--on-accent)' : 'var(--text-muted)',
                            }}
                          >
                            {done ? <Check size={14} /> : <Clock size={13} />}
                          </span>
                          <span className={index === currentIndex ? 'bold text-accent' : ''}>{step}</span>
                        </li>
                      );
                    })}
                  </ol>
                </>
              ) : (
                <p className="muted small">
                  Статус «{shipment.status || 'не указан'}» не соответствует известным этапам —
                  прогресс-бар не показываем, чтобы не вводить в заблуждение.
                </p>
              )}

              {shipment.createdAt && (
                <p className="dim tiny">Создано: {formatDate(shipment.createdAt)}</p>
              )}
            </div>
          )}
        </section>
      </div>

      {shipment && (
        <section className="card" style={{ marginBottom: 24 }}>
          <h3 className="flex gap-2" style={{ marginBottom: 20 }}><Navigation size={20} className="text-accent" /> История событий</h3>
          {shipment.events.length === 0 ? (
            <EmptyState
              title="Событий пока нет"
              description="Сервис не вернул историю перемещений для этого отправления."
            />
          ) : (
            <div className="stack">
              {shipment.events.map((event) => (
                <div key={event.id} className="flex gap-2" style={{ alignItems: 'flex-start' }}>
                  <span className="badge badge-accent" style={{ flexShrink: 0 }}>{event.status || 'Событие'}</span>
                  <div>
                    <div className="small">{event.note || 'Без комментария'}</div>
                    <div className="dim tiny">
                      {formatDate(event.date)}{event.location ? ` · ${event.location}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {isOwner && shipment && (
        <section className="card" style={{ marginBottom: 24 }}>
          <h3 className="flex gap-2" style={{ marginBottom: 6 }}><Send size={20} className="text-accent" /> Обновить статус (владелец)</h3>
          <p className="muted small" style={{ marginBottom: 18 }}>Изменение отправляется в сервис отслеживания и появится в истории событий.</p>
          <form className="stack" onSubmit={handleStatusUpdate}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="track-status">Новый статус</label>
              <select
                id="track-status"
                className="select"
                value={statusForm.status}
                onChange={(e) => setStatusForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Выберите статус</option>
                {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div className="grid grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="track-note">Комментарий</label>
                <input
                  id="track-note"
                  className="input"
                  type="text"
                  placeholder="Например, передано курьеру"
                  value={statusForm.note}
                  onChange={(e) => setStatusForm((prev) => ({ ...prev, note: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="track-location">Местоположение</label>
                <input
                  id="track-location"
                  className="input"
                  type="text"
                  placeholder="Город или склад"
                  value={statusForm.location}
                  onChange={(e) => setStatusForm((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={Boolean(busy)}>
              {busy === 'status' ? <><span className="spinner" /> Сохраняем…</> : <><RefreshCw size={16} /> Обновить статус</>}
            </button>
          </form>
        </section>
      )}

      {shipments.length > 0 && (
        <section className="card">
          <h3 className="flex gap-2" style={{ marginBottom: 18 }}><Truck size={20} className="text-accent" /> Все ваши отправления</h3>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Заказ</th><th>Статус</th><th>Адрес</th><th>Обновлено</th><th /></tr>
              </thead>
              <tbody>
                {shipments.map((item, shipmentIndex) => (
                  <tr key={item.id ?? item.orderId ?? `shipment-${shipmentIndex}`}>
                    <td>{item.orderId ?? '—'}</td>
                    <td><span className="badge">{item.status || '—'}</span></td>
                    <td className="muted">{item.address || '—'}</td>
                    <td className="muted small">{formatDate(item.updatedAt ?? item.createdAt)}</td>
                    <td className="text-right">
                      <button className="btn btn-ghost btn-sm" onClick={() => { setShipment(item); setOrderId(String(item.orderId ?? '')); }}>
                        Открыть
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

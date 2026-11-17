import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  ShoppingCart,
  Trash2,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/Modal';
import { LineSkeleton } from '../components/Skeleton';
import { formatPrice } from '../utils/product';

const DEFAULT_CATEGORIES = ['Пиво', 'Закуски', 'Мерч', 'Наборы', 'Сертификаты'];
const STATUSES = ['Ожидает оплаты', 'Оплачен', 'Собирается', 'В пути', 'Доставлен', 'Отменён'];
const EMPTY_PRODUCT = { name: '', category: 'Пиво', price: '', stockQuantity: '100', description: '' };

const dateOptions = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };

const formatDate = (value) => {
  if (!value) return '—';
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day, hours = 0, minutes = 0] = value;
    return new Date(year, month - 1, day, hours, minutes).toLocaleString('ru-RU', dateOptions);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('ru-RU', dateOptions);
};

const validateProduct = (form) => {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Укажите название (минимум 2 символа)';
  if (!form.category.trim()) errors.category = 'Выберите категорию';
  const price = Number(form.price);
  if (!Number.isFinite(price) || price <= 0) errors.price = 'Цена должна быть больше нуля';
  const stock = Number(form.stockQuantity);
  if (!Number.isInteger(stock) || stock < 0) errors.stockQuantity = 'Остаток — целое число от 0';
  return errors;
};

const errorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback;

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('stats');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [newErrors, setNewErrors] = useState({});
  const [isAdding, setIsAdding] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyProductId, setBusyProductId] = useState(null);

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_PRODUCT);
  const [editErrors, setEditErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      addNotification('Доступ запрещён: раздел доступен только владельцу.', 'error');
      navigate('/');
    }
  }, [isAdmin, addNotification, navigate]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    const [ordersResult, productsResult, customersResult] = await Promise.allSettled([
      axios.get('/api/orders'),
      axios.get('/api/products'),
      axios.get('/api/customers'),
    ]);

    const problems = [];
    if (ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value.data)) {
      setOrders(ordersResult.value.data);
    } else {
      setOrders([]);
      problems.push('заказы');
    }
    if (productsResult.status === 'fulfilled' && Array.isArray(productsResult.value.data)) {
      setProducts(productsResult.value.data);
    } else {
      setProducts([]);
      problems.push('товары');
    }
    if (customersResult.status === 'fulfilled' && Array.isArray(customersResult.value.data)) {
      setCustomers(customersResult.value.data);
    } else {
      setCustomers([]);
      problems.push('клиенты');
    }
    if (problems.length > 0) setLoadError(`Не удалось загрузить: ${problems.join(', ')}.`);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin, loadData]);

  if (!isAdmin) return null;

  const productNames = Object.fromEntries(products.map((product) => [product.id, product.name]));
  const categories = [...new Set([...DEFAULT_CATEGORIES, ...products.map((p) => p.category).filter(Boolean)])];
  const paidOrders = orders.filter((order) => String(order.status || '').toLowerCase() !== 'отменён');
  const revenue = paidOrders.reduce((sum, order) => sum + (Number(order.finalPrice) || 0), 0);
  const lowStock = products.filter((product) => (product.stockQuantity ?? 0) <= 5);

  const setNewField = (key) => (event) => {
    setNewProduct((prev) => ({ ...prev, [key]: event.target.value }));
    setNewErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const setEditField = (key) => (event) => {
    setEditForm((prev) => ({ ...prev, [key]: event.target.value }));
    setEditErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
    const errors = validateProduct(newProduct);
    setNewErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsAdding(true);
    try {
      const { data } = await axios.post('/api/products', {
        name: newProduct.name.trim(),
        category: newProduct.category.trim(),
        price: Number(newProduct.price),
        stockQuantity: Number(newProduct.stockQuantity),
        description: newProduct.description.trim(),
      });
      setProducts((prev) => [...prev, data]);
      setNewProduct(EMPTY_PRODUCT);
      addNotification('Товар успешно добавлен', 'success');
    } catch (error) {
      addNotification(errorMessage(error, 'Не удалось добавить товар'), 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const openEdit = (product) => {
    setEditTarget(product);
    setEditForm({
      name: product.name || '',
      category: product.category || 'Пиво',
      price: String(product.price ?? ''),
      stockQuantity: String(product.stockQuantity ?? 0),
      description: product.description || '',
    });
    setEditErrors({});
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (!editTarget) return;
    const errors = validateProduct(editForm);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    try {
      const { data } = await axios.put(`/api/products/${editTarget.id}`, {
        name: editForm.name.trim(),
        category: editForm.category.trim(),
        price: Number(editForm.price),
        stockQuantity: Number(editForm.stockQuantity),
        description: editForm.description.trim(),
      });
      setProducts((prev) => prev.map((product) => (product.id === data.id ? data : product)));
      setEditTarget(null);
      addNotification('Товар обновлён', 'success');
    } catch (error) {
      addNotification(errorMessage(error, 'Не удалось обновить товар'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeStock = async (product, delta) => {
    setBusyProductId(product.id);
    try {
      const { data } = await axios.patch(`/api/products/${product.id}/stock`, { quantity: delta });
      setProducts((prev) => prev.map((item) => (item.id === data.id ? data : item)));
      addNotification(`Остаток «${data.name}»: ${data.stockQuantity} шт.`, 'success');
    } catch (error) {
      addNotification(errorMessage(error, 'Не удалось изменить остаток'), 'error');
    } finally {
      setBusyProductId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyProductId(deleteTarget.id);
    try {
      await axios.delete(`/api/products/${deleteTarget.id}`);
      setProducts((prev) => prev.filter((product) => product.id !== deleteTarget.id));
      addNotification('Товар удалён', 'success');
      setDeleteTarget(null);
    } catch (error) {
      addNotification(errorMessage(error, 'Не удалось удалить товар'), 'error');
    } finally {
      setBusyProductId(null);
    }
  };

  const handleStatusChange = async (order, status) => {
    try {
      const { data } = await axios.patch(`/api/orders/${order.id}/status`, { status });
      setOrders((prev) => prev.map((item) => (item.id === data.id ? data : item)));
      addNotification(`Заказ #${data.id}: ${data.status}`, 'success');
    } catch (error) {
      addNotification(errorMessage(error, 'Не удалось обновить статус'), 'error');
    }
  };

  const statCards = [
    { label: 'Выручка', value: formatPrice(revenue), icon: DollarSign },
    { label: 'Заказы', value: paidOrders.length, icon: ShoppingCart },
    { label: 'Клиенты', value: customers.length, icon: Users },
    { label: 'Мало на складе', value: lowStock.length, icon: Package },
  ];

  return (
    <div className="container section">
      <div className="flex between wrap gap-2" style={{ marginBottom: 24 }}>
        <div>
          <span className="eyebrow">Панель управления</span>
          <h2>Админ-панель</h2>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-success">Владелец</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw size={16} /> Обновить
          </button>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Разделы админ-панели">
        {[
          { id: 'stats', label: 'Статистика' },
          { id: 'products', label: `Товары (${products.length})` },
          { id: 'orders', label: `Заказы (${orders.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loadError && <div className="card" style={{ borderColor: 'var(--danger)', marginBottom: 16 }}><span className="form-error">{loadError}</span></div>}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'stats' && (
            <div className="stack">
              {isLoading ? (
                <div className="grid grid-4">
                  {statCards.map((card) => (
                    <div className="card stack" key={card.label}>
                      <LineSkeleton width="40%" height={14} />
                      <LineSkeleton width="70%" height={32} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-4">
                  {statCards.map(({ label, value, icon: Icon }) => (
                    <div className="card flex gap-3" key={label}>
                      <Icon className="text-accent" size={34} />
                      <div>
                        <div className="small muted">{label}</div>
                        <div className="bold" style={{ fontSize: '1.6rem' }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && lowStock.length > 0 && (
                <div className="card stack">
                  <h3>Требуют пополнения</h3>
                  {lowStock.map((product) => (
                    <div className="flex between wrap gap-2 small" key={product.id}>
                      <span className="bold">{product.name}</span>
                      <span className={product.stockQuantity > 0 ? 'badge badge-accent' : 'badge badge-danger'}>
                        {product.stockQuantity ?? 0} шт.
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="stack">
              <form className="card stack" onSubmit={handleAddProduct} noValidate>
                <div className="flex gap-2"><Plus className="text-accent" size={20} /><h3>Добавить товар</h3></div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-name">Название</label>
                    <input id="new-name" className="input" value={newProduct.name} onChange={setNewField('name')} placeholder="Например, IPA «Хмельной»" />
                    {newErrors.name && <span className="form-error" role="alert">{newErrors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-category">Категория</label>
                    <select id="new-category" className="select" value={newProduct.category} onChange={setNewField('category')}>
                      {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                    {newErrors.category && <span className="form-error" role="alert">{newErrors.category}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-price">Цена, ₽</label>
                    <input id="new-price" className="input" type="number" min="1" step="0.01" value={newProduct.price} onChange={setNewField('price')} placeholder="299" />
                    {newErrors.price && <span className="form-error" role="alert">{newErrors.price}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-stock">Остаток, шт.</label>
                    <input id="new-stock" className="input" type="number" min="0" step="1" value={newProduct.stockQuantity} onChange={setNewField('stockQuantity')} />
                    {newErrors.stockQuantity && <span className="form-error" role="alert">{newErrors.stockQuantity}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-description">Описание</label>
                  <textarea id="new-description" className="textarea" value={newProduct.description} onChange={setNewField('description')} placeholder="Короткое описание товара" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isAdding} style={{ alignSelf: 'flex-start' }}>
                  {isAdding ? <><span className="spinner" /> Добавляем…</> : <><Plus size={17} /> Добавить товар</>}
                </button>
              </form>

              {isLoading ? (
                <div className="card stack"><LineSkeleton height={28} /><LineSkeleton height={28} /><LineSkeleton height={28} /></div>
              ) : products.length === 0 ? (
                <div className="card text-center muted">Товаров пока нет.</div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th><th>Товар</th><th>Категория</th><th>Цена</th><th>Остаток</th><th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td className="dim">#{product.id}</td>
                          <td>
                            <div className="bold">{product.name}</div>
                            <div className="dim tiny">{product.description || '—'}</div>
                          </td>
                          <td><span className="badge">{product.category}</span></td>
                          <td className="text-accent bold">{formatPrice(product.price)}</td>
                          <td>
                            <div className="flex wrap gap-2">
                              <span className={product.stockQuantity > 5 ? 'badge badge-success' : 'badge badge-danger'}>
                                {product.stockQuantity ?? 0} шт.
                              </span>
                              <button type="button" className="btn btn-ghost btn-sm" disabled={busyProductId === product.id} onClick={() => handleChangeStock(product, -1)} aria-label={`Уменьшить остаток: ${product.name}`}>−</button>
                              <button type="button" className="btn btn-ghost btn-sm" disabled={busyProductId === product.id} onClick={() => handleChangeStock(product, 1)} aria-label={`Увеличить остаток: ${product.name}`}>+</button>
                              <button type="button" className="btn btn-outline btn-sm" disabled={busyProductId === product.id} onClick={() => handleChangeStock(product, 10)} aria-label={`Добавить 10 шт: ${product.name}`}>+10</button>
                            </div>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(product)} aria-label={`Редактировать: ${product.name}`}><Pencil size={16} /></button>
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(product)} aria-label={`Удалить: ${product.name}`}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            isLoading ? (
              <div className="card stack"><LineSkeleton height={28} /><LineSkeleton height={28} /><LineSkeleton height={28} /></div>
            ) : orders.length === 0 ? (
              <div className="card text-center muted">Заказов пока нет.</div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th><th>Дата</th><th>Клиент</th><th>Товар</th><th>Кол-во</th><th>Сумма</th><th>Оплата</th><th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="bold">#{order.id}</td>
                        <td className="dim small">{formatDate(order.createdAt)}</td>
                        <td>{order.customerId}</td>
                        <td>{productNames[order.productId] || `Товар #${order.productId}`}</td>
                        <td>{order.quantity ?? '—'}</td>
                        <td className="text-accent bold">{formatPrice(order.finalPrice)}</td>
                        <td className="small muted">{order.paymentMethod || '—'}</td>
                        <td>
                          <select
                            className="select"
                            aria-label={`Статус заказа #${order.id}`}
                            value={order.status || STATUSES[0]}
                            onChange={(event) => handleStatusChange(order, event.target.value)}
                          >
                            {[...new Set([order.status, ...STATUSES].filter(Boolean))].map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </motion.div>
      </AnimatePresence>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Удалить товар?"
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Отмена</button>
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={busyProductId === deleteTarget?.id}>
              {busyProductId === deleteTarget?.id ? <><span className="spinner" /> Удаляем…</> : 'Удалить'}
            </button>
          </>
        }
      >
        <p className="muted">
          Товар «{deleteTarget?.name}» будет удалён из каталога. Это действие нельзя отменить.
        </p>
      </Modal>

      <Modal
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title={`Редактировать товар #${editTarget?.id ?? ''}`}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setEditTarget(null)}>Отмена</button>
            <button type="submit" form="edit-product-form" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? <><span className="spinner" /> Сохраняем…</> : 'Сохранить'}
            </button>
          </>
        }
      >
        <form id="edit-product-form" className="stack" onSubmit={handleSaveEdit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-name">Название</label>
            <input id="edit-name" className="input" value={editForm.name} onChange={setEditField('name')} />
            {editErrors.name && <span className="form-error" role="alert">{editErrors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-category">Категория</label>
            <select id="edit-category" className="select" value={editForm.category} onChange={setEditField('category')}>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            {editErrors.category && <span className="form-error" role="alert">{editErrors.category}</span>}
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-price">Цена, ₽</label>
              <input id="edit-price" className="input" type="number" min="1" step="0.01" value={editForm.price} onChange={setEditField('price')} />
              {editErrors.price && <span className="form-error" role="alert">{editErrors.price}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-stock">Остаток, шт.</label>
              <input id="edit-stock" className="input" type="number" min="0" step="1" value={editForm.stockQuantity} onChange={setEditField('stockQuantity')} />
              {editErrors.stockQuantity && <span className="form-error" role="alert">{editErrors.stockQuantity}</span>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-description">Описание</label>
            <textarea id="edit-description" className="textarea" value={editForm.description} onChange={setEditField('description')} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Gift,
  MapPin,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { categoryEmoji, formatPrice } from '../utils/product';
import { createShipment } from '../services/platformApi';
import EmptyState from '../components/EmptyState';

const paymentMethods = [
  { id: 'card', name: 'Банковская карта', icon: '💳' },
  { id: 'sbp', name: 'СБП (QR-код)', icon: '📱' },
  { id: 'sber', name: 'СберPay', icon: '🟢' },
  { id: 'tinkoff', name: 'Тинькофф', icon: '🟡' },
  { id: 'yoomoney', name: 'ЮMoney', icon: '🟣' },
  { id: 'qiwi', name: 'QIWI Кошелёк', icon: '🥝' },
  { id: 'crypto', name: 'Криптовалюта', icon: '₿' },
  { id: 'applepay', name: 'Apple Pay', icon: '🍎' },
  { id: 'googlepay', name: 'Google Pay', icon: '🤖' },
  { id: 'cash', name: 'При получении', icon: '💵' },
];

const steps = ['Данные доставки', 'Оплата', 'Подтверждение'];

// Скидки совпадают с расчётом на сервере (order-service).
const promoPercent = (code) => {
  switch ((code || '').trim().toUpperCase()) {
    case 'URE4KA':
    case 'BEER5': return 0.05;
    case 'BEER10': return 0.10;
    case 'BEER15': return 0.15;
    default: return 0;
  }
};

const promoDiscountFor = (code, amount) => {
  const upper = (code || '').trim().toUpperCase();
  if (upper === 'CASH500') return Math.min(Number(amount) || 0, 500);
  return (Number(amount) || 0) * promoPercent(upper);
};

function Summary({ cart, subtotal, promoLabel, promoDiscount, bonusSpent, deliveryFee, finalTotal, bonusesEarned }) {
  return (
    <div className="card stack">
      <div className="flex between">
        <h3>Ваш заказ</h3>
        <span className="badge badge-accent">{cart.reduce((sum, item) => sum + item.quantity, 0)} шт.</span>
      </div>

      <div className="stack gap-2">
        {cart.map((item) => (
          <div className="flex gap-2" key={item.id}>
            <span className="badge badge-accent" aria-hidden="true">{categoryEmoji(item.category)}</span>
            <div className="flex between wrap gap-2" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ minWidth: 0 }}>
                <div className="bold small">{item.name}</div>
                <div className="dim tiny">{item.quantity} шт. × {formatPrice(item.price)}</div>
              </div>
              <span className="small bold">{formatPrice(Number(item.price) * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="divider" style={{ margin: '8px 0' }} />

      <div className="stack gap-2 small">
        <div className="flex between"><span className="muted">Товары</span><span>{formatPrice(subtotal)}</span></div>
        {promoDiscount > 0 && (
          <div className="flex between text-accent">
            <span>Промокод {promoLabel}</span><span>−{formatPrice(promoDiscount)}</span>
          </div>
        )}
        {bonusSpent > 0 && (
          <div className="flex between text-accent">
            <span>Списание бонусов</span><span>−{formatPrice(bonusSpent)}</span>
          </div>
        )}
        <div className="flex between">
          <span className="muted">Доставка</span>
          <span className={deliveryFee === 0 ? 'text-accent' : ''}>
            {deliveryFee === 0 ? 'Бесплатно' : formatPrice(deliveryFee)}
          </span>
        </div>
        <div className="flex between bold" style={{ fontSize: '1.25rem' }}>
          <span>Итого</span><span className="text-accent">{formatPrice(finalTotal)}</span>
        </div>
        <p className="dim tiny" style={{ marginTop: 2 }}>
          Итоговая сумма и скидки подтверждаются сервером при оплате.
        </p>
        {bonusesEarned > 0 && (
          <div className="flex between tiny" style={{ color: 'var(--success)' }}>
            <span>Начислим бонусов</span><span>+{formatPrice(bonusesEarned)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Checkout() {
  const { cart, getTotal, removeFromCart, setQuantity } = useCart();
  const {
    user,
    addOrderToHistory,
    getUserBonusBalance,
    getUserPromos,
    removePromoFromUser,
  } = useAuth();

  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState({ name: '', phone: '', address: '' });
  const [errors, setErrors] = useState({});
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
  const [selectedPromo, setSelectedPromo] = useState('');
  const [useBonuses, setUseBonuses] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [result, setResult] = useState(null);

  const subtotal = getTotal();
  const promos = getUserPromos() || [];
  const selectedPromoData = promos.find((p) => p.promoCode === selectedPromo);
  const promoLabel = selectedPromoData?.promoCode || '';
  const promoDiscount = promoDiscountFor(selectedPromo, subtotal);
  const freeDelivery = (selectedPromo || '').trim().toUpperCase() === 'FREEDEL';
  const deliveryFee = subtotal > 0 && subtotal < 2000 && !freeDelivery ? 300 : 0;

  const bonusAvailable = Math.max(0, Number(getUserBonusBalance()) || 0);
  const maxBonus = Math.max(0, Math.min(bonusAvailable, Math.floor((subtotal - promoDiscount) * 0.5)));
  const bonusSpent = useBonuses ? maxBonus : 0;
  const finalTotal = Math.max(0, subtotal - promoDiscount - bonusSpent + deliveryFee);
  const bonusesEarned = Math.floor(finalTotal * 0.1);

  const [stockMap, setStockMap] = useState({});
  const [stockLoading, setStockLoading] = useState(true);
  const [stockLoadError, setStockLoadError] = useState('');

  // Сверяем корзину с актуальным каталогом: сервер всё равно проверяет остатки,
  // но так покупатель видит проблему до нажатия «Оплатить».
  useEffect(() => {
    if (cart.length === 0) {
      setStockMap({});
      setStockLoading(false);
      setStockLoadError('');
      return undefined;
    }
    const controller = new AbortController();
    let cancelled = false;
    setStockLoading(true);
    setStockLoadError('');
    axios.get('/api/products', { signal: controller.signal })
      .then((response) => {
        if (cancelled) return;
        const list = Array.isArray(response.data) ? response.data : [];
        const map = {};
        list.forEach((product) => { map[String(product.id)] = product; });
        setStockMap(map);
      })
      .catch((requestError) => {
        if (cancelled || axios.isCancel(requestError)) return;
        setStockMap({});
        setStockLoadError('Не удалось проверить наличие заранее. Цена и остатки будут подтверждены сервером при оплате.');
      })
      .finally(() => { if (!cancelled) setStockLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [cart]);

  const stockChecked = !stockLoading && !stockLoadError;
  const stockProblems = stockChecked ? cart.map((item) => {
    const product = stockMap[String(item.id)];
    if (!product) {
      return { item, type: 'missing', message: 'Товар больше не продаётся', available: 0 };
    }
    const available = Math.max(0, Number(product.stockQuantity) || 0);
    if (available < item.quantity) {
      return {
        item,
        type: 'insufficient',
        message: `Недостаточно товара: доступно ${available}, в корзине ${item.quantity}`,
        available,
      };
    }
    return null;
  }).filter(Boolean) : [];

  const setDeliveryField = (key) => (event) => {
    setDelivery((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setOrderError('');
  };

  const validateDelivery = () => {
    const nextErrors = {};
    const name = delivery.name.trim();
    const phoneDigits = delivery.phone.replace(/\D/g, '');
    const address = delivery.address.trim();

    if (name.length < 2) nextErrors.name = 'Укажите имя (минимум 2 символа)';
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      nextErrors.phone = 'Введите корректный номер телефона';
    }
    if (address.length < 5) nextErrors.address = 'Укажите город, улицу, дом и квартиру';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goToPayment = () => {
    if (validateDelivery()) {
      setOrderError('');
      setStep(2);
    }
  };

  const handlePay = async () => {
    if (!user) {
      setOrderError('Войдите в аккаунт через шапку сайта, чтобы оформить заказ.');
      return;
    }
    if (cart.length === 0) {
      setOrderError('Корзина пуста. Добавьте товары перед оформлением.');
      return;
    }
    if (stockProblems.length > 0) {
      setOrderError('Обновите количество или уберите товары, которых больше нет в наличии.');
      return;
    }

    setIsProcessing(true);
    setOrderError('');

    // Сервер считает цену сам, но бонусы распределяем по позициям заранее,
    // чтобы не списывать одну и ту же сумму по несколько раз.
    const weights = cart.map((item) => {
      const base = Number(item.price) * item.quantity;
      return Math.max(0, base - promoDiscountFor(selectedPromo, base));
    });
    const weightSum = weights.reduce((sum, value) => sum + value, 0) || 1;
    let bonusLeft = bonusSpent;
    const perItemBonus = weights.map((weight, index) => {
      if (index === weights.length - 1) return bonusLeft;
      const share = Math.min(bonusLeft, Math.round(bonusSpent * weight / weightSum));
      bonusLeft -= share;
      return share;
    });

    try {
      const responses = await Promise.allSettled(cart.map((item, index) => axios.post('/api/orders', {
        customerId: user.id,
        productId: item.id,
        quantity: item.quantity,
        paymentMethod: selectedMethod.name,
        promoCode: selectedPromo || undefined,
        bonusSpent: perItemBonus[index] || 0,
      })));

      const succeeded = [];
      const failed = [];

      responses.forEach((response, index) => {
        const item = cart[index];
        const order = response.status === 'fulfilled' ? response.value?.data : null;

        if (order && order.id != null) {
          succeeded.push({ item, order, bonus: perItemBonus[index] || 0 });
        } else {
          const reason = response.status === 'rejected'
            ? (response.reason?.response?.data?.message || response.reason?.message || 'Ошибка соединения с сервером')
            : 'Сервер не вернул номер заказа';
          failed.push({ item, reason });
        }
      });

      // Сохраняем в локальную историю только реально созданные заказы.
      succeeded.forEach(({ item, order, bonus }, index) => {
        const itemBase = Number(item.price) * item.quantity;
        const paid = Number(order.finalPrice) || 0;
        addOrderToHistory({
          id: order.id,
          date: new Date().toLocaleString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
          }),
          items: `${item.name} (${item.quantity} шт.)`,
          productId: item.id,
          quantity: item.quantity,
          originalTotal: itemBase,
          appliedPromo: promoLabel,
          promoDiscount: promoDiscountFor(selectedPromo, itemBase),
          bonusDiscount: bonus,
          delivery: index === 0 ? deliveryFee : 0,
          finalTotal: paid,
          bonusesEarned: Math.floor(paid * 0.1),
          bonusesSpent: bonus,
          status: order.status || 'Оплачен',
          method: order.paymentMethod || selectedMethod.name,
          transactionId: order.transactionId,
        });
      });

      let shipmentWarning = '';
      if (succeeded.length > 0) {
        if (selectedPromo) removePromoFromUser(selectedPromo);
        succeeded.forEach(({ item }) => removeFromCart(item.id));

        // Адрес из формы передаём в сервис доставки. Ошибка отслеживания не должна
        // отменять уже оплаченные заказы, поэтому показываем её отдельно.
        const shipmentResults = await Promise.allSettled(succeeded.map(({ order }) => createShipment({
          orderId: order.id,
          customerId: user.id,
          address: delivery.address,
        })));
        const failedShipments = shipmentResults.filter((entry) => entry.status === 'rejected').length;
        if (failedShipments > 0) {
          shipmentWarning = `Не удалось создать отслеживание для ${failedShipments} из ${succeeded.length} заказ(ов). Адрес: ${delivery.address}.`;
        }
      }

      setResult({ succeeded, failed, shipmentWarning });

      if (failed.length > 0 && succeeded.length === 0) {
        setOrderError(
          `Не удалось оформить заказ: ${failed.map((f) => `${f.item.name} — ${f.reason}`).join('; ')}`,
        );
      } else {
        setStep(3);
      }
    } catch {
      setOrderError('Ошибка соединения с сервером. Попробуйте ещё раз.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="container section">
        <EmptyState
          title="Корзина пуста"
          description="Добавьте товары из каталога, чтобы оформить заказ."
          action={(
            <Link to="/catalog" className="btn btn-primary btn-lg">Перейти в каталог</Link>
          )}
        />
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section-head text-center">
        <span className="eyebrow">Оформление заказа</span>
        <h2>Почти у вас дома</h2>
        <p>Три коротких шага — и отличное пиво будет в пути.</p>
      </div>

      <div className="flex wrap gap-2" role="list" aria-label="Этапы оформления" style={{ marginBottom: 24 }}>
        {steps.map((label, index) => (
          <span
            key={label}
            role="listitem"
            className={`chip ${step >= index + 1 ? 'chip-active' : ''}`}
            aria-current={step === index + 1 ? 'step' : undefined}
          >
            {index + 1}. {label}
          </span>
        ))}
      </div>

      {step !== 3 && (stockProblems.length > 0 || stockLoadError) && (
        <div className="card" role="alert" style={{ borderColor: 'var(--danger)', marginBottom: 24 }}>
          <div className="flex gap-2" style={{ alignItems: 'flex-start' }}>
            <AlertCircle size={20} color="var(--danger)" />
            <div className="stack gap-2" style={{ flex: 1, minWidth: 0 }}>
              <strong>
                {stockProblems.length > 0
                  ? 'Проверьте корзину перед оплатой'
                  : 'Не удалось проверить наличие'}
              </strong>
              {stockProblems.length > 0 && (
                <p className="small muted" style={{ margin: 0 }}>
                  Наличие изменилось с момента добавления товаров. Обновите количество или уберите позиции.
                </p>
              )}
              {stockLoadError && (
                <p className="small muted" style={{ margin: 0 }}>{stockLoadError}</p>
              )}
              {stockProblems.map(({ item, message, available, type }) => (
                <div
                  key={item.id}
                  className="flex between wrap gap-2"
                  style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 10 }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="bold small">{item.name}</div>
                    <div className="small" style={{ color: 'var(--danger)' }}>{message}</div>
                  </div>
                  <div className="flex gap-2">
                    {type === 'insufficient' && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setQuantity(item.id, Math.max(1, available))}
                      >
                        Обновить количество
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Убрать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step !== 3 && (
          <motion.div
            key={`form-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="grid grid-2"
          >
            <div className="card stack">
              {step === 1 && (
                <>
                  <div className="flex gap-2">
                    <MapPin className="text-accent" size={22} />
                    <h3>Данные доставки</h3>
                  </div>
                  <p className="small muted">
                    Эти данные нужны курьеру и для подтверждения заказа.
                  </p>

                  <div className="form-group">
                    <label className="form-label" htmlFor="checkout-name">Ваше имя</label>
                    <input
                      id="checkout-name"
                      className="input"
                      type="text"
                      autoComplete="name"
                      placeholder="Иван"
                      value={delivery.name}
                      onChange={setDeliveryField('name')}
                      aria-invalid={Boolean(errors.name)}
                    />
                    {errors.name && <span className="form-error" role="alert">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="checkout-phone">Телефон</label>
                    <input
                      id="checkout-phone"
                      className="input"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+7 (999) 123-45-67"
                      value={delivery.phone}
                      onChange={setDeliveryField('phone')}
                      aria-invalid={Boolean(errors.phone)}
                    />
                    {errors.phone && <span className="form-error" role="alert">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="checkout-address">Адрес доставки</label>
                    <input
                      id="checkout-address"
                      className="input"
                      type="text"
                      autoComplete="street-address"
                      placeholder="Город, улица, дом, квартира"
                      value={delivery.address}
                      onChange={setDeliveryField('address')}
                      aria-invalid={Boolean(errors.address)}
                    />
                    {errors.address && <span className="form-error" role="alert">{errors.address}</span>}
                  </div>

                  <button type="button" className="btn btn-primary btn-lg btn-block" onClick={goToPayment}>
                    Продолжить <ArrowRight size={18} />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="flex gap-2">
                    <CreditCard className="text-accent" size={22} />
                    <h3>Способ оплаты</h3>
                  </div>

                  <div className="grid grid-4 gap-2">
                    {paymentMethods.map((method) => {
                      const active = selectedMethod.id === method.id;
                      return (
                        <button
                          type="button"
                          key={method.id}
                          className={`card card-hover ${active ? 'badge-accent' : ''}`}
                          onClick={() => setSelectedMethod(method)}
                          aria-pressed={active}
                          style={{ padding: 14, minHeight: 92 }}
                        >
                          <span className="stack center text-center" style={{ gap: 6 }}>
                            <span style={{ fontSize: '1.45rem' }} aria-hidden="true">{method.icon}</span>
                            <span className="small bold">{method.name}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="divider" style={{ margin: '4px 0' }} />

                  <div className="flex gap-2">
                    <Tag className="text-accent" size={20} />
                    <h3>Скидки и бонусы</h3>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="checkout-promo">Промокод</label>
                    <select
                      id="checkout-promo"
                      className="select"
                      value={selectedPromo}
                      onChange={(event) => setSelectedPromo(event.target.value)}
                    >
                      <option value="">Без промокода</option>
                      {promos.map((promo, index) => (
                        <option key={`${promo.promoCode}-${index}`} value={promo.promoCode}>
                          {promo.prize} · {promo.promoCode}
                        </option>
                      ))}
                    </select>
                    {promoDiscount > 0 && (
                      <span className="badge badge-success" style={{ alignSelf: 'flex-start' }}>
                        Скидка {formatPrice(promoDiscount)}
                      </span>
                    )}
                  </div>

                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={useBonuses}
                      onChange={(event) => setUseBonuses(event.target.checked)}
                      disabled={maxBonus <= 0}
                    />
                    <span>
                      Списать бонусы: доступно {formatPrice(bonusAvailable)}, к списанию {formatPrice(maxBonus)} (не более 50%)
                    </span>
                  </label>

                  {!user && (
                    <div className="card" role="alert" style={{ borderColor: 'var(--danger)' }}>
                      <span className="form-error">
                        Войдите в аккаунт через шапку сайта, чтобы оформить заказ.
                      </span>
                    </div>
                  )}

                  {orderError && (
                    <div className="card" role="alert" style={{ borderColor: 'var(--danger)' }}>
                      <div className="flex gap-2">
                        <AlertCircle size={18} color="var(--danger)" />
                        <span className="form-error">{orderError}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setStep(1)}
                      disabled={isProcessing}
                    >
                      <ArrowLeft size={18} /> Назад
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handlePay}
                      disabled={isProcessing || !user || stockProblems.length > 0}
                      style={{ flex: '1 1 220px' }}
                    >
                      {isProcessing ? (
                        <><span className="spinner" /> Обрабатываем…</>
                      ) : (
                        <><ShieldCheck size={18} /> Оплатить {formatPrice(finalTotal)}</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="stack">
              <Summary
                cart={cart}
                subtotal={subtotal}
                promoLabel={promoLabel}
                promoDiscount={promoDiscount}
                bonusSpent={bonusSpent}
                deliveryFee={deliveryFee}
                finalTotal={finalTotal}
                bonusesEarned={bonusesEarned}
              />
              <div className="card">
                <div className="flex gap-2 muted small">
                  <Gift size={18} className="text-accent" />
                  <span>Бонусы начисляются после успешной оплаты заказа.</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && result && (
          <motion.div
            key="done"
            className="card text-center stack"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.28 }}
          >
            <CheckCircle2 size={72} className="text-accent" style={{ margin: '0 auto' }} />
            <h2>{result.failed.length === 0 ? 'Заказ оформлен!' : 'Часть заказа оформлена'}</h2>

            <p className="muted">
              {result.failed.length === 0
                ? 'Спасибо! Все позиции оплачены, мы уже собираем ваш заказ.'
                : 'Удалось оформить не все позиции. Остальные товары остались в корзине — их можно повторить.'}
            </p>

            {result.succeeded.length > 0 && (
              <div className="badge badge-success" style={{ alignSelf: 'center', flexWrap: 'wrap' }}>
                Номера заказов: {result.succeeded.map(({ order }) => `#${order.id}`).join(', ')}
              </div>
            )}

            {result.shipmentWarning && (
              <div className="card" role="status" style={{ borderColor: 'var(--warning, #f5a524)', textAlign: 'left' }}>
                <p className="small" style={{ margin: 0 }}>{result.shipmentWarning}</p>
              </div>
            )}

            {result.failed.length > 0 && (
              <div className="card" style={{ borderColor: 'var(--danger)', textAlign: 'left' }}>
                <h3 className="form-error" style={{ marginBottom: 10 }}>Не оформленные позиции</h3>
                <ul className="stack gap-2 small">
                  {result.failed.map(({ item, reason }) => (
                    <li key={item.id}>
                      <span className="bold">{item.name}</span>
                      <span className="muted"> — {reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex wrap gap-2 center">
              <Link to="/profile" className="btn btn-primary btn-lg">В личный кабинет</Link>
              {result.failed.length > 0 && (
                <button type="button" className="btn btn-outline btn-lg" onClick={() => { setResult(null); setStep(2); }}>
                  Повторить оформление
                </button>
              )}
              <Link to="/catalog" className="btn btn-ghost btn-lg">В каталог</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

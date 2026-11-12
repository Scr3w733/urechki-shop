import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, MapPin, XCircle, Wallet, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const paymentMethods = [
  { id: 'card', name: 'Банковская карта', icon: '💳' },
  { id: 'sbp', name: 'СБП (QR-код)', icon: '📱' },
  { id: 'sber', name: 'СберPay', icon: '🟢' },
  { id: 'tinkoff', name: 'Тинькофф', icon: '🟡' },
  { id: 'yoomoney', name: 'ЮMoney', icon: '🟣' },
  { id: 'qiwi', name: 'QIWI Кошелек', icon: '🥝' },
  { id: 'crypto', name: 'Криптовалюта', icon: '₿' },
  { id: 'applepay', name: 'Apple Pay', icon: '🍎' },
  { id: 'googlepay', name: 'Google Pay', icon: '🤖' },
  { id: 'cash', name: 'При получении', icon: '💵' },
];

export default function Checkout() {
  const { cart, getTotal, clearCart } = useCart();
  const { user, addOrderToHistory, getUserBonusBalance, getUserPromos, removePromoFromUser } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);

  const [useBonuses, setUseBonuses] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState("");

  const total = getTotal();
  const delivery = total > 0 && total < 2000 ? 300 : 0;
  const totalBonusAvailable = getUserBonusBalance();
  
  let promoDiscount = 0;
  let appliedPromoName = "";
  if (selectedPromo) {
    const promo = getUserPromos().find(p => p.promoCode === selectedPromo);
    if (promo) {
      appliedPromoName = promo.prize;
      if (promo.promoCode.includes('5')) promoDiscount = total * 0.05;
      else if (promo.promoCode.includes('10')) promoDiscount = total * 0.10;
      else if (promo.promoCode.includes('15')) promoDiscount = total * 0.15;
    }
  }

  let bonusDiscount = 0;
  if (useBonuses) {
    const maxBonus = total * 0.5;
    bonusDiscount = Math.min(totalBonusAvailable, maxBonus);
  }

  const finalTotal = Math.max(0, total - promoDiscount - bonusDiscount + delivery);
  const bonusesEarned = finalTotal * 0.1; 

  const handlePay = async () => {
    if (!user) {
      setOrderError("Вы должны войти в аккаунт, чтобы оформить заказ!");
      return;
    }

    setIsProcessing(true);
    setOrderError(null);

    try {
      const response = await axios.post('http://localhost:8082/api/orders', {
        customerId: user.id, 
        productId: cart[0].id, 
        quantity: cart[0].quantity,
        finalPrice: finalTotal 
      });

      const newOrderId = response.data.id || Math.floor(Math.random() * 10000);
      setOrderId(newOrderId);
      
      // Если использовали промокод - удаляем его из профиля
      if (selectedPromo) {
        removePromoFromUser(selectedPromo);
      }
      
      addOrderToHistory({
        id: newOrderId,
        date: new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        items: cart.map(i => `${i.name} (${i.quantity} шт.)`).join(', '),
        originalTotal: total,
        appliedPromo: appliedPromoName,
        promoDiscount: promoDiscount,
        bonusDiscount: bonusDiscount,
        delivery: delivery,
        finalTotal: finalTotal,
        bonusesEarned: bonusesEarned,
        bonusesSpent: bonusDiscount,
        status: 'Принят', // Начальный статус для трекинга
        method: selectedMethod.name
      });

      setStep(3);
      setTimeout(() => { clearCart(); }, 500); 
    } catch (error) {
      console.error("Ошибка при оплате", error);
      const msg = error.response?.data?.message || "Ошибка соединения с сервером";
      setOrderError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div style={{ padding: '150px 10%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', color: '#fff', marginBottom: '20px' }}>Корзина пуста</h1>
        <Link to="/catalog"><button style={{ background: '#d4af37', color: '#000', padding: '15px 30px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}>Перейти в каталог</button></Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(20px, 5vw, 80px) 5%', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#d4af37', textAlign: 'center', marginBottom: '50px' }}>Оформление заказа</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '2px', background: '#333', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', top: '20px', left: '10%', width: `${(step - 1) * 40}%`, height: '2px', background: '#d4af37', zIndex: 1, transition: '0.3s' }}></div>
        {[1, 2, 3].map(num => (
          <div key={num} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: step >= num ? '#d4af37' : '#1a1a1a', color: step >= num ? '#000' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid', borderColor: step >= num ? '#d4af37' : '#333' }}>
              {num === 3 && step === 3 ? <CheckCircle size={24} /> : num}
            </div>
            <span style={{ color: step >= num ? '#fff' : '#666', fontSize: '0.9rem' }}>{num === 1 ? 'Доставка' : num === 2 ? 'Оплата' : 'Готово'}</span>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 40px)', position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div key="step1" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}>
              <h2 style={{ color: '#fff', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin color="#d4af37"/> Куда доставить?</h2>
              <input type="text" placeholder="Город, улица, дом, квартира" value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%', padding: '15px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '1.1rem', marginBottom: '30px', outline: 'none' }} />
              <button onClick={() => setStep(2)} disabled={!address} style={{ width: '100%', padding: '15px', background: address ? '#d4af37' : '#333', color: address ? '#000' : '#888', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: address ? 'pointer' : 'not-allowed' }}>Продолжить</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}>
              <h2 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Wallet color="#d4af37"/> Способ оплаты</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', marginBottom: '30px' }}>
                {paymentMethods.map(method => (
                  <motion.div key={method.id} onClick={() => setSelectedMethod(method)} whileHover={{ scale: 1.02 }} style={{ background: selectedMethod.id === method.id ? 'rgba(212,175,55,0.2)' : '#111', border: `1px solid ${selectedMethod.id === method.id ? '#d4af37' : '#333'}`, padding: '15px 5px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
                    <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>{method.name}</span>
                  </motion.div>
                ))}
              </div>

              <div style={{ background: '#111', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #333' }}>
                <h3 style={{ color: '#d4af37', marginBottom: '15px', fontSize: '1.1rem' }}>Скидки и бонусы</h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ color: '#ccc', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><Gift size={16}/> Применить промокод:</label>
                  <select value={selectedPromo} onChange={(e) => setSelectedPromo(e.target.value)} style={{ width: '100%', padding: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '5px', outline: 'none' }}>
                    <option value="">-- Без промокода --</option>
                    {getUserPromos().map((p, i) => (
                      <option key={i} value={p.promoCode}>{p.prize} ({p.promoCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ color: '#ccc', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={useBonuses} onChange={(e) => setUseBonuses(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#d4af37' }} />
                    Списать бонусы (Доступно: {totalBonusAvailable.toFixed(0)} ₽, макс. 50%)
                  </label>
                </div>
              </div>

              {orderError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid #ff4444', padding: '15px', borderRadius: '8px', color: '#ff4444', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <XCircle size={20} /> {orderError}
                </motion.div>
              )}
              
              <div style={{ borderTop: '1px solid #333', paddingTop: '20px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', marginBottom: '10px' }}><span>Товары:</span><span>{total} ₽</span></div>
                {promoDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#44ff44', marginBottom: '10px' }}><span>Скидка по промокоду:</span><span>-{promoDiscount.toFixed(0)} ₽</span></div>}
                {bonusDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#44ff44', marginBottom: '10px' }}><span>Списание бонусов:</span><span>-{bonusDiscount.toFixed(0)} ₽</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', marginBottom: '10px' }}><span>Доставка:</span><span>{delivery === 0 ? 'Бесплатно' : `${delivery} ₽`}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d4af37', fontSize: '1.5rem', fontWeight: 'bold' }}><span>Итого:</span><span>{finalTotal.toFixed(0)} ₽</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#44ff44', marginTop: '10px', fontSize: '0.9rem' }}><span>Будет начислено бонусов:</span><span>+{bonusesEarned.toFixed(0)} ₽</span></div>
              </div>

              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <button onClick={() => setStep(1)} disabled={isProcessing} style={{ flex: 1, minWidth: '100px', padding: '15px', background: 'transparent', border: '1px solid #888', color: '#888', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Назад</button>
                <button onClick={handlePay} disabled={isProcessing} style={{ flex: 2, minWidth: '200px', padding: '15px', background: '#d4af37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
                  {isProcessing ? 'ОБРАБОТКА...' : `Оплатить ${finalTotal.toFixed(0)} ₽`}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
              <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                <CheckCircle size={80} color="#44ff44" style={{ margin: '0 auto 20px' }} />
              </motion.div>
              <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: '15px' }}>Заказ оформлен!</h2>
              <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '30px' }}>Номер заказа: <span style={{ color: '#d4af37', fontWeight: 'bold' }}>#{orderId}</span>.</p>
              <Link to="/profile">
                <button style={{ background: '#d4af37', color: '#000', padding: '15px 40px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>В личный кабинет</button>
              </Link>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, CreditCard, MapPin, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Checkout() {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');

  const total = getTotal();
  const delivery = total > 0 && total < 2000 ? 300 : 0;
  const finalTotal = total + delivery;

  const handlePay = () => {
    // Здесь мы бы отправляли данные на наш Java-сервис
    // Например: axios.post('http://localhost:8082/api/orders', {...})
    setStep(3);
    setTimeout(() => { clearCart(); }, 500); // Очищаем корзину после успеха
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
    <div style={{ padding: '80px 10%', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '3rem', color: '#d4af37', textAlign: 'center', marginBottom: '50px' }}>Оформление заказа</h1>
      
      {/* Индикатор шагов */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '2px', background: '#333', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', top: '20px', left: '10%', width: `${(step - 1) * 40}%`, height: '2px', background: '#d4af37', zIndex: 1, transition: '0.3s' }}></div>
        
        {[1, 2, 3].map(num => (
          <div key={num} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: step >= num ? '#d4af37' : '#1a1a1a', color: step >= num ? '#000' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid', borderColor: step >= num ? '#d4af37' : '#333', transition: '0.3s' }}>
              {num === 3 && step === 3 ? <CheckCircle size={24} /> : num}
            </div>
            <span style={{ color: step >= num ? '#fff' : '#666', fontSize: '0.9rem' }}>{num === 1 ? 'Доставка' : num === 2 ? 'Оплата' : 'Готово'}</span>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          
          {/* ШАГ 1: Адрес */}
          {step === 1 && (
            <motion.div key="step1" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}>
              <h2 style={{ color: '#fff', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin color="#d4af37"/> Куда доставить?</h2>
              <input type="text" placeholder="Город, улица, дом, квартира" value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%', padding: '15px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '1.1rem', marginBottom: '30px', outline: 'none' }} />
              <button onClick={() => setStep(2)} disabled={!address} style={{ width: '100%', padding: '15px', background: address ? '#d4af37' : '#333', color: address ? '#000' : '#888', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: address ? 'pointer' : 'not-allowed' }}>Продолжить</button>
            </motion.div>
          )}

          {/* ШАГ 2: Оплата */}
          {step === 2 && (
            <motion.div key="step2" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}>
              <h2 style={{ color: '#fff', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}><CreditCard color="#d4af37"/> Способ оплаты</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid #d4af37', cursor: 'pointer' }}>
                  <input type="radio" name="pay" defaultChecked /> <span style={{ color: '#fff' }}>Банковская карта (Visa / MIR)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid #333', cursor: 'pointer' }}>
                  <input type="radio" name="pay" /> <span style={{ color: '#fff' }}>СБП (Оплата по QR)</span>
                </label>
              </div>
              
              <div style={{ borderTop: '1px solid #333', paddingTop: '20px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', marginBottom: '10px' }}><span>Товары:</span><span>{total} ₽</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', marginBottom: '10px' }}><span>Доставка:</span><span>{delivery === 0 ? 'Бесплатно' : `${delivery} ₽`}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d4af37', fontSize: '1.5rem', fontWeight: 'bold' }}><span>Итого:</span><span>{finalTotal} ₽</span></div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '15px', background: 'transparent', border: '1px solid #888', color: '#888', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Назад</button>
                <button onClick={handlePay} style={{ flex: 2, padding: '15px', background: '#d4af37', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>Оплатить {finalTotal} ₽</button>
              </div>
            </motion.div>
          )}

          {/* ШАГ 3: Успех */}
          {step === 3 && (
            <motion.div key="step3" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
              <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                <CheckCircle size={80} color="#44ff44" style={{ margin: '0 auto 20px' }} />
              </motion.div>
              <h2 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '15px' }}>Заказ оформлен!</h2>
              <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '30px' }}>Номер вашего заказа: <span style={{ color: '#d4af37', fontWeight: 'bold' }}>#{Math.floor(Math.random() * 10000)}</span>. Мы свяжемся с вами в ближайшее время для подтверждения.</p>
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
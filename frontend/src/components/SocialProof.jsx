import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Settings, EyeOff } from 'lucide-react';

const names = ["Алексей", "Мария", "Дмитрий", "Ольга", "Сергей", "Анна", "Иван", "Елена", "Максим", "Татьяна", "Артем", "Ксения"];
const cities = ["Новосибирска", "Москвы", "Санкт-Петербурга", "Кемерово", "Томска", "Барнаула", "Омска", "Красноярска"];
const products = ["Пиво Жигулевское", "Набор 'Пивной вечер'", "Футболка 'Beer Lover'", "Сухарики 'У Речушки'", "Вяленый лещ", "IPA Сибирское", "Худи 'У Речушки'", "Подарочный сертификат"];
const times = ["только что", "1 минуту назад", "2 минуты назад", "5 минут назад"];

export default function SocialProof() {
  const [toast, setToast] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;

    const showRandomToast = () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const time = times[Math.floor(Math.random() * times.length)];
      
      setToast({ name, city, product, time });
      setTimeout(() => setToast(null), 5000);
    };

    const initialTimer = setTimeout(showRandomToast, 7000);
    const interval = setInterval(showRandomToast, 25000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isEnabled]);

  return (
    <>
      {/* Кнопка настроек соц. доказательств (внизу слева) */}
      <div style={{ position: 'fixed', bottom: '30px', left: '30px', zIndex: 9997, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          style={{ background: 'rgba(30,30,30,0.8)', border: '1px solid #333', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888' }}
        >
          <Settings size={20} />
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ background: '#151515', border: '1px solid #d4af37', padding: '15px', borderRadius: '10px', width: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
              <p style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '10px', fontWeight: 'bold' }}>Уведомления о покупках</p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} style={{ accentColor: '#d4af37' }} />
                Показывать уведомления
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Само уведомление */}
      <AnimatePresence>
        {isEnabled && toast && (
          <motion.div 
            initial={{ opacity: 0, x: -50, y: 50 }} 
            animate={{ opacity: 1, x: 0, y: 0 }} 
            exit={{ opacity: 0, x: -50 }}
            style={{ position: 'fixed', bottom: '90px', left: '30px', background: 'rgba(15, 15, 15, 0.95)', border: '1px solid #d4af37', padding: '15px', borderRadius: '15px', zIndex: 9998, display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', maxWidth: '350px' }}
          >
            <div style={{ background: 'linear-gradient(135deg, #d4af37, #8b0000)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>{toast.name[0]}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '3px' }}>
                <strong style={{ color: '#d4af37' }}>{toast.name}</strong> из {toast.city}
              </p>
              <p style={{ color: '#aaa', fontSize: '0.8rem', lineHeight: '1.3' }}>купил(а) <span style={{ color: '#fff' }}>{toast.product}</span></p>
              <span style={{ color: '#666', fontSize: '0.7rem', marginTop: '5px', display: 'block' }}>{toast.time}</span>
            </div>
            <button onClick={() => setToast(null)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', alignSelf: 'flex-start' }}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
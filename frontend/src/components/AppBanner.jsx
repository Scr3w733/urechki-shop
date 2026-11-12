import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AppBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Показываем баннер через 15 секунд после захода
    const timer = setTimeout(() => {
      const hasSeen = localStorage.getItem('urechki_app_banner_seen');
      if (!hasSeen) setIsVisible(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  const closeBanner = () => {
    setIsVisible(false);
    localStorage.setItem('urechki_app_banner_seen', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '600px', background: 'linear-gradient(135deg, #1a1a1a, #000)', border: '1px solid var(--accent)', borderRadius: '20px', padding: '20px', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
        >
          <button onClick={closeBanner} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
            <X size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
            <div style={{ background: 'rgba(212,175,55,0.2)', padding: '12px', borderRadius: '15px' }}>
              <Smartphone size={30} color="var(--accent)" />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>Установи наше приложение!</p>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Скидка 10% на первый заказ в приложении.</p>
            </div>
          </div>

          <Link to="/app" onClick={closeBanner} style={{ background: 'var(--accent)', color: '#000', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
            Подробнее <ArrowRight size={16} />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
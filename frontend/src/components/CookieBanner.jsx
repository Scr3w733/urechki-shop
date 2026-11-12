import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('urechki_cookies_accepted');
    if (!accepted) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('urechki_cookies_accepted', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="cookie-banner"
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '95%', maxWidth: '800px', background: 'rgba(20,20,20,0.98)', border: '1px solid var(--accent)', borderRadius: '15px', padding: '15px 20px', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
            <Cookie color="var(--accent)" size={28} style={{ flexShrink: 0 }} />
            <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: '1.4' }}>
              Мы используем файлы cookie для улучшения работы сайта.
            </p>
          </div>
          <button onClick={acceptCookies} style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
            Принять
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'urechki_cookie_consent';

export default function CookieBanner() {
  const [choice, setChoice] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const reduceMotion = useReducedMotion();

  const decide = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* storage may be unavailable */
    }
    setChoice(value);
  };

  return (
    <AnimatePresence>
      {!choice && (
        <motion.aside
          role="region"
          aria-label="Использование файлов cookie"
          className="glass-panel"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          style={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            right: 16,
            marginInline: 'auto',
            maxWidth: 720,
            zIndex: 9700,
            padding: '12px 16px',
          }}
        >
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            <Cookie size={20} className="text-accent" style={{ flexShrink: 0 }} aria-hidden="true" />
            <p className="small muted" style={{ flex: '1 1 260px', lineHeight: 1.45 }}>
              Мы используем cookie, чтобы сайт работал удобнее. Подробнее — в{' '}
              <Link to="/faq" className="text-accent">FAQ</Link>.
            </p>
            <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => decide('rejected')}>Отклонить</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => decide('accepted')}>Принять</button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

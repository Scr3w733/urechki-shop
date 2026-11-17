import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Smartphone, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'urechki_app_banner_seen';

export default function AppBanner() {
  const [visible, setVisible] = useState(() => {
    try {
      return !localStorage.getItem(STORAGE_KEY);
    } catch {
      return true;
    }
  });
  const reduceMotion = useReducedMotion();

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* storage may be unavailable */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          role="region"
          aria-label="Мобильное приложение"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          style={{
            overflow: 'hidden',
            background: 'rgba(var(--accent-rgb), .08)',
            borderBottom: '1px solid var(--border-accent)',
          }}
        >
          <div className="container flex between gap-2" style={{ minHeight: 44, paddingBlock: 8 }}>
            <div className="flex gap-2" style={{ minWidth: 0 }}>
              <Smartphone size={17} className="text-accent" style={{ flexShrink: 0 }} aria-hidden="true" />
              <p className="small muted" style={{ lineHeight: 1.4 }}>
                Скоро приложение «У Речушки» — заказы и бонусы под рукой.{' '}
                <Link to="/app" className="text-accent bold">Подробнее</Link>
              </p>
            </div>
            <button type="button" className="icon-btn" style={{ width: 30, height: 30, flexShrink: 0 }} onClick={dismiss} aria-label="Скрыть баннер">
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

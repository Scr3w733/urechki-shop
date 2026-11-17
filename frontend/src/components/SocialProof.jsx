import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';

const DISMISSED_KEY = 'urechki_social_proof_dismissed';
const SHOWN_KEY = 'urechki_social_proof_shown';

const EXAMPLES = [
  { name: 'Алексей', city: 'Новосибирска', product: 'IPA «Сибирское»' },
  { name: 'Мария', city: 'Томска', product: 'набор «Пивной вечер»' },
  { name: 'Дмитрий', city: 'Кемерово', product: 'пиво «Жигулёвское»' },
  { name: 'Ольга', city: 'Барнаула', product: 'подарочный сертификат' },
  { name: 'Иван', city: 'Омска', product: 'сухарики «У Речушки»' },
];

export default function SocialProof() {
  const [purchase, setPurchase] = useState(null);
  const timersRef = useRef([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const largeScreen = window.matchMedia('(min-width: 1024px)');
    let alreadySeen = false;
    try {
      alreadySeen = Boolean(localStorage.getItem(DISMISSED_KEY) || sessionStorage.getItem(SHOWN_KEY));
    } catch {
      alreadySeen = false;
    }

    if (!largeScreen.matches || alreadySeen) return undefined;

    // one subtle notice per session, well after the user has settled in
    timersRef.current.push(setTimeout(() => {
      setPurchase(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]);
      try {
        sessionStorage.setItem(SHOWN_KEY, '1');
      } catch {
        /* storage may be unavailable */
      }
      timersRef.current.push(setTimeout(() => setPurchase(null), 9000));
    }, 45000));

    const onResize = (event) => {
      if (!event.matches) setPurchase(null);
    };
    largeScreen.addEventListener('change', onResize);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      largeScreen.removeEventListener('change', onResize);
    };
  }, []);

  const dismiss = () => {
    setPurchase(null);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      /* storage may be unavailable */
    }
  };

  return (
    <AnimatePresence>
      {purchase && (
        <motion.aside
          role="status"
          aria-live="polite"
          aria-label="Недавняя покупка"
          className="glass-panel"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          style={{
            position: 'fixed',
            left: 20,
            bottom: 20,
            zIndex: 9600,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            maxWidth: 330,
            padding: '12px 14px',
          }}
        >
          <span className="badge badge-accent" style={{ width: 32, height: 32, padding: 0, justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">
            <ShoppingBag size={15} />
          </span>
          <div style={{ minWidth: 0 }}>
            <p className="small" style={{ color: 'var(--text)', lineHeight: 1.45 }}>
              <strong>{purchase.name}</strong> из {purchase.city} заказал(а) {purchase.product}
            </p>
            <p className="tiny dim" style={{ marginTop: 3 }}>Спасибо, что вы с нами</p>
          </div>
          <button type="button" className="icon-btn" style={{ width: 26, height: 26, flexShrink: 0 }} onClick={dismiss} aria-label="Скрыть уведомление">
            <X size={14} />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

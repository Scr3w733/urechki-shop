import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const dashOffset = useTransform(scrollYProgress, (value) => CIRCUMFERENCE * (1 - value));
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          className="icon-btn"
          onClick={scrollToTop}
          aria-label="Наверх"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
          style={{
            position: 'fixed',
            right: 20,
            bottom: 88,
            width: 48,
            height: 48,
            zIndex: 9600,
            background: 'rgba(23, 23, 27, .92)',
            flexShrink: 0,
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
          >
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="4" />
            <motion.circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>
          <ArrowUp size={18} className="text-accent" style={{ position: 'relative' }} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

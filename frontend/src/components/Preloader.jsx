import { motion, useReducedMotion } from 'framer-motion';
import { Beer } from 'lucide-react';

export default function Preloader() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.25 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        background: 'var(--bg)',
      }}
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={reduceMotion ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(var(--accent-rgb), .12)',
          border: '1px solid var(--border-accent)',
        }}
      >
        <Beer size={30} className="text-accent" aria-hidden="true" />
      </motion.div>
      <span className="bold text-accent" style={{ letterSpacing: '0.12em', fontSize: '0.95rem' }}>У РЕЧУШКИ</span>
      <span className="small dim">Загружаем сайт…</span>
      <span className="spinner" aria-hidden="true" style={{ opacity: reduceMotion ? 0 : 1 }} />
    </motion.div>
  );
}

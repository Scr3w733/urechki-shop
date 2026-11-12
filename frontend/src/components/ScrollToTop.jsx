import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) setIsVisible(true);
      else setIsVisible(false);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          style={{ position: 'fixed', bottom: '30px', right: '110px', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(20,20,20,0.8)', border: '2px solid #333', cursor: 'pointer', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Круговой SVG прогресс */}
          <svg style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="var(--accent)" strokeWidth="6" strokeDasharray="289" strokeDashoffset={289 - (289 * scrollYProgress.get())} />
          </svg>
          <ArrowUp size={24} color="var(--accent)" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
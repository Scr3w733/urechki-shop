import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #d4af37, #ffdf00)',
        transformOrigin: '0%',
        scaleX,
        zIndex: 10000,
        boxShadow: '0 0 10px rgba(212,175,55,0.8)'
      }}
    />
  );
}



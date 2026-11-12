import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function CustomCursor() {
  const { cursorStyle } = useTheme();
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  if (typeof window !== 'undefined' && (window.innerWidth < 768 || cursorStyle === 'default')) return null;

  return (
    <>
      {cursorStyle === 'neon' && (
        <>
          <motion.div style={{ position: 'fixed', top: 0, left: 0, width: '30px', height: '30px', borderRadius: '50%', border: '2px solid var(--accent)', pointerEvents: 'none', zIndex: 99999, x: cursorXSpring, y: cursorYSpring, translateX: '-50%', translateY: '-50%' }} />
          <motion.div style={{ position: 'fixed', top: 0, left: 0, width: '6px', height: '6px', backgroundColor: 'var(--accent)', borderRadius: '50%', pointerEvents: 'none', zIndex: 100000, x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }} />
        </>
      )}

      {cursorStyle === 'dot' && (
        <motion.div style={{ position: 'fixed', top: 0, left: 0, width: '15px', height: '15px', backgroundColor: 'var(--accent)', borderRadius: '50%', pointerEvents: 'none', zIndex: 100000, x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%', boxShadow: '0 0 10px var(--accent)' }} />
      )}

      {cursorStyle === 'crosshair' && (
        <motion.div style={{ position: 'fixed', top: 0, left: 0, width: '40px', height: '40px', pointerEvents: 'none', zIndex: 100000, x: cursorXSpring, y: cursorYSpring, translateX: '-50%', translateY: '-50%' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', background: 'var(--accent)', transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, width: '2px', height: '100%', background: 'var(--accent)', transform: 'translateX(-50%)' }} />
        </motion.div>
      )}
    </>
  );
}
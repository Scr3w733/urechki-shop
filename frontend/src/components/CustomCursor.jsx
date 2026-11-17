import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const SPRING = { damping: 28, stiffness: 650, mass: 0.4 };

export default function CustomCursor() {
  const { cursorStyle } = useTheme();
  const reduceMotion = useReducedMotion();
  const [finePointer, setFinePointer] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  );

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const smoothX = useSpring(x, SPRING);
  const smoothY = useSpring(y, SPRING);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onChange = (event) => setFinePointer(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const enabled = cursorStyle !== 'default' && finePointer;

  useEffect(() => {
    if (!enabled) return undefined;
    const onMove = (event) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [enabled, x, y]);

  // The native cursor is never hidden here. With the default style or on touch
  // devices nothing is rendered at all.
  if (!enabled) return null;

  const positioned = {
    position: 'fixed',
    left: reduceMotion ? x : smoothX,
    top: reduceMotion ? y : smoothY,
    pointerEvents: 'none',
    zIndex: 99999,
  };

  if (cursorStyle === 'dot') {
    return (
      <motion.div
        aria-hidden="true"
        style={{
          ...positioned,
          width: 10,
          height: 10,
          marginLeft: -5,
          marginTop: -5,
          borderRadius: '50%',
          background: 'var(--accent)',
          boxShadow: '0 0 12px rgba(var(--accent-rgb), .55)',
        }}
      />
    );
  }

  if (cursorStyle === 'crosshair') {
    return (
      <motion.div
        aria-hidden="true"
        style={{ ...positioned, width: 36, height: 36, marginLeft: -18, marginTop: -18, opacity: 0.85 }}
      >
        <span style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 1, background: 'var(--accent)', transform: 'translateY(-50%)' }} />
        <span style={{ position: 'absolute', left: '50%', top: 0, width: 1, height: '100%', background: 'var(--accent)', transform: 'translateX(-50%)' }} />
        <span style={{ position: 'absolute', top: '50%', left: '50%', width: 4, height: 4, margin: -2, borderRadius: '50%', background: 'var(--accent)' }} />
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{
          ...positioned,
          width: 26,
          height: 26,
          marginLeft: -13,
          marginTop: -13,
          borderRadius: '50%',
          border: '1px solid var(--accent)',
          opacity: 0.75,
        }}
      />
      <motion.div
        aria-hidden="true"
        style={{
          ...positioned,
          zIndex: 100000,
          width: 5,
          height: 5,
          marginLeft: -2.5,
          marginTop: -2.5,
          borderRadius: '50%',
          background: 'var(--accent)',
        }}
      />
    </>
  );
}

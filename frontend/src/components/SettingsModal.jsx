import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Paintbrush } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsModal({ isOpen, onClose }) {
  const { theme, setTheme, THEMES } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(10px)' }} onClick={onClose}>
          <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={e => e.stopPropagation()} className="glass-panel" style={{ padding: '40px', width: '90%', maxWidth: '450px', position: 'relative' }}>
            <X onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer', color: 'var(--accent)' }} />
            
            <h2 style={{ color: 'var(--accent)', marginBottom: '10px', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Paintbrush /> Настройки
            </h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>Настройте внешний вид сайта под себя</p>

            <h3 style={{ color: '#fff', marginBottom: '15px', fontSize: '1.1rem' }}>Акцентный цвет</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {Object.entries(THEMES).map(([key, t]) => (
                <button 
                  key={key}
                  onClick={() => setTheme(t)}
                  style={{ 
                    background: t.color, 
                    color: key === 'gold' || key === 'green' ? '#000' : '#fff', 
                    border: theme.color === t.color ? '3px solid #fff' : '3px solid transparent',
                    padding: '15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    transition: '0.2s'
                  }}
                >
                  {theme.color === t.color && <Check size={18} />} {t.name}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function InfoModal({ isOpen, onClose, title, text }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, backdropFilter: 'blur(10px)' }} onClick={onClose}>
          <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} onClick={e => e.stopPropagation()} className="glass-panel" style={{ padding: '40px', width: '90%', maxWidth: '500px', position: 'relative' }}>
            <X onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer', color: '#d4af37' }} />
            <h2 style={{ color: '#d4af37', marginBottom: '20px', fontSize: '2rem' }}>{title}</h2>
            <p style={{ color: '#ccc', lineHeight: '1.8', fontSize: '1.1rem' }}>{text}</p>
            <button onClick={onClose} style={{ marginTop: '30px', width: '100%', background: '#d4af37', color: '#000', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Понятно</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
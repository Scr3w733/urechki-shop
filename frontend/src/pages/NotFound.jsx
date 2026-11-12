import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Beer, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '150px 5%', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
        <Beer size={120} color="#d4af37" style={{ marginBottom: '30px', opacity: 0.5 }} />
      </motion.div>
      <h1 style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', fontWeight: 900, color: '#d4af37', lineHeight: 1, marginBottom: '20px' }}>404</h1>
      <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: '#fff', marginBottom: '20px' }}>Ой! Эта страница уже выпита.</h2>
      <p style={{ color: '#aaa', fontSize: '1.2rem', marginBottom: '40px', maxWidth: '600px' }}>Кажется, вы свернули не туда. Возможно, эта страница была удалена или вы ошиблись в адресе.</p>
      
      <Link to="/">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ background: '#d4af37', color: '#000', border: 'none', padding: '15px 40px', borderRadius: '30px', fontSize: '1.2rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ArrowLeft size={20} /> На главную
        </motion.button>
      </Link>
    </motion.div>
  );
}
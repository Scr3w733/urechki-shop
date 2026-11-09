import { motion } from 'framer-motion';
import { Beer } from 'lucide-react';

export default function Preloader() {
  return (
    <motion.div 
      initial={{ opacity: 1 }} 
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#030303', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        <Beer size={80} color="#d4af37" />
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{ color: '#d4af37', marginTop: '20px', letterSpacing: '5px', fontSize: '1.5rem', fontWeight: 'bold' }}
      >
        У РЕЧУШКИ
      </motion.h2>
      <motion.div 
        initial={{ width: 0 }} animate={{ width: '200px' }} transition={{ duration: 1.5 }}
        style={{ height: '3px', background: '#d4af37', marginTop: '20px', borderRadius: '10px' }}
      />
    </motion.div>
  );
}
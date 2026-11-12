import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const commands = [
  { id: 1, name: 'Главная страница', path: '/', type: 'Страница' },
  { id: 2, name: 'Каталог товаров', path: '/catalog', type: 'Страница' },
  { id: 3, name: 'Конструктор мерча', path: '/merch', type: 'Страница' },
  { id: 4, name: 'Колесо Фортуны', path: '/roulette', type: 'Страница' },
  { id: 5, name: 'Личный кабинет', path: '/profile', type: 'Страница' },
  { id: 6, name: 'История и блог', path: '/blog', type: 'Страница' },
  { id: 7, name: 'Мобильное приложение', path: '/app', type: 'Страница' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = commands.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh', zIndex: 99999, backdropFilter: 'blur(5px)' }} onClick={() => setIsOpen(false)}>
          <motion.div initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }} onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '600px', background: '#111', border: '1px solid #333', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #333' }}>
              <Search size={20} color="#888" />
              <input autoFocus type="text" placeholder="Поиск по сайту (Ctrl+K)..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '1.1rem', marginLeft: '15px', outline: 'none' }} />
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20}/></button>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px' }}>
              {filtered.length === 0 ? (
                <p style={{ color: '#666', padding: '20px', textAlign: 'center' }}>Ничего не найдено</p>
              ) : (
                filtered.map(c => (
                  <div key={c.id} onClick={() => handleSelect(c.path)} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer' }} className="command-item">
                    <span style={{ color: '#fff' }}>{c.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent)', fontSize: '0.8rem' }}><CornerDownLeft size={14}/> Перейти</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
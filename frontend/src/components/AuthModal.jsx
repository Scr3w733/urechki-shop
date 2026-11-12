import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Клиент');
  const [error, setError] = useState(null);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await register(name, email, password, role);
    }

    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)' }} onClick={onClose}>
          <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} onClick={e => e.stopPropagation()} className="glass-panel" style={{ padding: '40px', width: '90%', maxWidth: '400px', position: 'relative' }}>
            <X onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer', color: '#d4af37' }} />
            
            <h2 style={{ color: '#d4af37', textAlign: 'center', marginBottom: '30px', fontSize: '2rem' }}>
              {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
            </h2>

            {error && <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid #ff4444', color: '#ff4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {!isLogin && (
                <div style={{ display: 'flex', alignItems: 'center', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '10px 15px' }}>
                  <User size={20} color="#888" />
                  <input type="text" placeholder="Ваше Имя" required value={name} onChange={e => setName(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', marginLeft: '10px', outline: 'none', width: '100%' }} />
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '10px 15px' }}>
                <Mail size={20} color="#888" />
                <input type="email" placeholder="Email (ivan@mail.ru)" required value={email} onChange={e => setEmail(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', marginLeft: '10px', outline: 'none', width: '100%' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '10px 15px' }}>
                <Lock size={20} color="#888" />
                <input type="password" placeholder="Пароль (123)" required value={password} onChange={e => setPassword(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', marginLeft: '10px', outline: 'none', width: '100%' }} />
              </div>

              {!isLogin && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <select value={role} onChange={e => setRole(e.target.value)} style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }}>
                    <option value="Клиент">Клиент</option>
                    <option value="Менеджер">Менеджер</option>
                    <option value="Владелец">Владелец</option>
                  </select>
                </div>
              )}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={{ background: '#d4af37', color: '#000', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px' }}>
                {isLogin ? 'ВОЙТИ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
              </motion.button>
            </form>

            <p style={{ color: '#aaa', textAlign: 'center', marginTop: '20px', cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => { setIsLogin(!isLogin); setError(null); }}>
              {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войти'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
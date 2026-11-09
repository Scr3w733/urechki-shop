import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldCheck, Mail, Award, Box } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const [orders] = useState([
    { id: 1024, date: '10.11.2026', total: 270, status: 'Доставлен' },
    { id: 1025, date: '12.11.2026', total: 1500, status: 'В пути' }
  ]);

  if (!user) return <div style={{ padding: '150px 10%', textAlign: 'center', fontSize: '1.5rem' }}>Пожалуйста, войдите в аккаунт (кнопка "Войти" справа вверху).</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '80px 10%', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3rem', color: '#d4af37' }}>Личный Кабинет</h1>
        <button onClick={logout} style={{ background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
          <LogOut size={18} /> Выйти
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '50px' }}>
        {/* Карточка профиля */}
        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #d4af37, #8b0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', marginBottom: '20px', color: '#fff' }}>
            {user.name[0].toUpperCase()}
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '5px' }}>{user.name}</h2>
          <p style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}><Mail size={16} /> {user.email}</p>
          
          <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
            <span style={{ background: 'rgba(212,175,55,0.2)', color: '#d4af37', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', border: '1px solid #d4af37' }}>
              {user.role}
            </span>
            <span style={{ background: 'rgba(68, 255, 68, 0.1)', color: '#44ff44', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', border: '1px solid #44ff44' }}>
              {user.status}
            </span>
          </div>
        </div>

        {/* Статистика / Бонусы */}
        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Award color="#d4af37"/> Ваши бонусы</h3>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: '#d4af37', marginBottom: '10px' }}>1 250 ₽</div>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Копите бонусы с каждой покупки и оплачивайте ими до 50% заказа. Спасибо, что вы с нами!</p>
        </div>
      </div>

      {/* История заказов */}
      <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Box color="#d4af37" /> Мои заказы</h2>
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333', color: '#aaa' }}>
              <th style={{ padding: '15px' }}>Номер заказа</th>
              <th style={{ padding: '15px' }}>Дата</th>
              <th style={{ padding: '15px' }}>Сумма</th>
              <th style={{ padding: '15px' }}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '15px', color: '#d4af37', fontWeight: 'bold' }}>#{order.id}</td>
                <td style={{ padding: '15px', color: '#fff' }}>{order.date}</td>
                <td style={{ padding: '15px', color: '#fff', fontWeight: 'bold' }}>{order.total} ₽</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ background: order.status === 'Доставлен' ? 'rgba(68,255,68,0.1)' : 'rgba(255,165,0,0.1)', color: order.status === 'Доставлен' ? '#44ff44' : 'orange', padding: '5px 10px', borderRadius: '10px', fontSize: '0.9rem' }}>{order.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Плашка "Разработчик" */}
      {user.role === 'Разработчик' && (
        <div style={{ marginTop: '40px', background: 'rgba(212,175,55,0.1)', border: '1px solid #d4af37', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ color: '#d4af37', fontWeight: 'bold' }}>Служебный аккаунт. Разработчик проекта: Притчин Владимир, группа 9-прг401.</p>
        </div>
      )}
    </motion.div>
  );
}
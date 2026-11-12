import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { LogOut, Mail, Award, Box, Gift, Heart, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, logout, getUserOrders, getUserBonusBalance, getUserPromos, getWishlist } = useAuth();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('orders');
  const [canClaimBonus, setCanClaimBonus] = useState(false);

  const orders = getUserOrders() || [];
  const promos = getUserPromos() || [];
  const wishlist = getWishlist() || [];
  const bonusBalance = getUserBonusBalance();

  useEffect(() => {
    if (user) {
      const lastClaim = localStorage.getItem(`urechki_last_bonus_${user.email}`);
      const today = new Date().toDateString();
      if (lastClaim !== today) setCanClaimBonus(true);
    }
  }, [user]);

  const claimDailyBonus = () => {
    if (!canClaimBonus) return;
    const today = new Date().toDateString();
    localStorage.setItem(`urechki_last_bonus_${user.email}`, today);
    
    const currentBonus = Number(localStorage.getItem(`urechki_bonus_${user.email}`) || 0);
    localStorage.setItem(`urechki_bonus_${user.email}`, currentBonus + 50);
    
    addNotification('Вы получили 50 бонусных рублей!', 'success');
    setCanClaimBonus(false);
    window.location.reload(); 
  };

  if (!user) return <div style={{ padding: '150px 10%', textAlign: 'center', color: '#fff' }}>Войдите в аккаунт</div>;

  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.finalTotal) || 0), 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '80px 5%', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>Профиль</h1>
        <button onClick={logout} style={{ background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '5px' }}><LogOut size={18}/> Выйти</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '15px' }}>{user.name[0].toUpperCase()}</div>
          <h2 style={{ color: '#fff' }}>{user.name}</h2>
          <p style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}><Mail size={16}/> {user.email}</p>
        </div>

        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}><Award color="var(--accent)"/> Бонусный счет</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)' }}>{bonusBalance.toFixed(0)} ₽</div>
          
          <button 
            onClick={claimDailyBonus} 
            disabled={!canClaimBonus}
            style={{ marginTop: '20px', background: canClaimBonus ? 'var(--accent)' : '#222', color: canClaimBonus ? '#000' : '#555', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: canClaimBonus ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}
          >
            {canClaimBonus ? 'Забрать ежедневный бонус (+50 ₽)' : <><CheckCircle size={18}/> Бонус получен сегодня</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid #333', marginBottom: '20px', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('orders')} style={{ background: 'transparent', border: 'none', color: activeTab === 'orders' ? 'var(--accent)' : '#888', padding: '10px 0', borderBottom: activeTab === 'orders' ? '2px solid var(--accent)' : 'none', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>Заказы ({orders.length})</button>
        <button onClick={() => setActiveTab('wishlist')} style={{ background: 'transparent', border: 'none', color: activeTab === 'wishlist' ? 'var(--accent)' : '#888', padding: '10px 0', borderBottom: activeTab === 'wishlist' ? '2px solid var(--accent)' : 'none', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>Избранное ({wishlist.length})</button>
        <button onClick={() => setActiveTab('promos')} style={{ background: 'transparent', border: 'none', color: activeTab === 'promos' ? 'var(--accent)' : '#888', padding: '10px 0', borderBottom: activeTab === 'promos' ? '2px solid var(--accent)' : 'none', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>Промокоды ({promos.length})</button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'orders' && (
          <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {orders.length === 0 ? <p style={{ color: '#888' }}>Нет заказов</p> : orders.map((o, i) => (
              <div key={i} className="glass-panel" style={{ padding: '20px', marginBottom: '15px', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4 style={{ color: '#fff' }}>Заказ #{o.id}</h4>
                  <span style={{ color: 'var(--accent)' }}>{o.finalTotal} ₽</span>
                </div>
                <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{o.items}</p>
                <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '5px' }}>{o.date}</p>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'wishlist' && (
          <motion.div key="wishlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {wishlist.length === 0 ? <p style={{ color: '#888' }}>Пусто</p> : wishlist.map(p => (
              <div key={p.id} className="glass-panel" style={{ padding: '15px' }}>
                <h4 style={{ color: '#fff' }}>{p.name}</h4>
                <p style={{ color: 'var(--accent)', marginTop: '10px' }}>{p.price} ₽</p>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'promos' && (
          <motion.div key="promos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {promos.length === 0 ? <p style={{ color: '#888' }}>Нет промокодов</p> : promos.map((p, i) => (
              <div key={i} style={{ background: 'rgba(212,175,55,0.1)', border: '1px dashed var(--accent)', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                <Gift color="var(--accent)" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ color: '#fff' }}>{p.prize}</h4>
                <div style={{ background: '#000', color: 'var(--accent)', padding: '5px', marginTop: '10px', borderRadius: '5px', fontWeight: 'bold' }}>{p.promoCode}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
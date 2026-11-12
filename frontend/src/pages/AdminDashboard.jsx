import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DollarSign, ShoppingCart, Users, Package, Trash2, Plus, Edit } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('stats');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  // Форма нового товара
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Пиво', price: '', description: '' });

  useEffect(() => {
    if (!user || user.role !== 'Владелец') {
      addNotification('Доступ запрещен. Вы не владелец.', 'error');
      navigate('/');
      return;
    }

    axios.get('http://localhost:8082/api/orders').then(res => setOrders(res.data)).catch(() => {});
    axios.get('http://localhost:8080/api/products').then(res => setProducts(res.data)).catch(() => {});
    axios.get('http://localhost:8081/api/customers').then(res => setCustomers(res.data)).catch(() => {});
  }, [user, navigate, addNotification]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/products', {
        ...newProduct,
        price: Number(newProduct.price),
        stockQuantity: 100
      });
      addNotification('Товар успешно добавлен!', 'success');
      setNewProduct({ name: '', category: 'Пиво', price: '', description: '' });
      // Обновляем список
      axios.get('http://localhost:8080/api/products').then(res => setProducts(res.data));
    } catch (err) {
      addNotification('Ошибка при добавлении товара', 'error');
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.finalPrice) || 0), 0);

  const renderTab = () => {
    switch(activeTab) {
      case 'stats':
        return (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <DollarSign color="var(--accent)" size={40} />
                <div><p style={{ color: '#aaa' }}>Выручка</p><h3 style={{ color: '#fff', fontSize: '1.5rem' }}>{totalRevenue} ₽</h3></div>
              </div>
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <ShoppingCart color="var(--accent)" size={40} />
                <div><p style={{ color: '#aaa' }}>Заказы</p><h3 style={{ color: '#fff', fontSize: '1.5rem' }}>{orders.length}</h3></div>
              </div>
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Users color="var(--accent)" size={40} />
                <div><p style={{ color: '#aaa' }}>Клиенты</p><h3 style={{ color: '#fff', fontSize: '1.5rem' }}>{customers.length}</h3></div>
              </div>
            </div>
          </div>
        );
      case 'products':
        return (
          <div>
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', marginBottom: '15px' }}>Добавить товар</h3>
              <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr auto', gap: '10px' }}>
                <input placeholder="Название" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '5px' }} />
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '5px' }}>
                  <option>Пиво</option><option>Закуски</option><option>Мерч</option>
                </select>
                <input type="number" placeholder="Цена" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '5px' }} />
                <input placeholder="Описание" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} required style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '5px' }} />
                <button type="submit" style={{ background: 'var(--accent)', border: 'none', padding: '10px', borderRadius: '5px', fontWeight: 'bold' }}><Plus size={20}/></button>
              </form>
            </div>
            <div className="glass-panel" style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', color: '#fff' }}>
                <thead><tr style={{ borderBottom: '1px solid #333' }}><th>ID</th><th>Название</th><th>Цена</th><th>Действия</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '10px' }}>{p.id}</td><td>{p.name}</td><td>{p.price} ₽</td>
                      <td><Trash2 color="#ff4444" size={18} style={{ cursor: 'pointer' }} onClick={() => addNotification('Функция в разработке', 'info')} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="glass-panel" style={{ padding: '20px', maxHeight: '500px', overflowY: 'auto' }}>
             <table style={{ width: '100%', textAlign: 'left', color: '#fff' }}>
                <thead><tr style={{ borderBottom: '1px solid #333' }}><th>ID</th><th>Клиент ID</th><th>Сумма</th><th>Статус</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '10px' }}>#{o.id}</td><td>{o.customerId}</td><td style={{ color: 'var(--accent)' }}>{o.finalPrice} ₽</td>
                      <td><span style={{ background: 'rgba(68,255,68,0.1)', color: '#44ff44', padding: '3px 8px', borderRadius: '10px' }}>Выполнен</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        );
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '80px 5%', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>Админ-Панель</h1>
        <span style={{ background: 'rgba(68,255,68,0.1)', color: '#44ff44', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold' }}>Владелец</span>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('stats')} style={{ padding: '10px 20px', background: activeTab === 'stats' ? 'var(--accent)' : '#111', color: activeTab === 'stats' ? '#000' : '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Статистика</button>
        <button onClick={() => setActiveTab('products')} style={{ padding: '10px 20px', background: activeTab === 'products' ? 'var(--accent)' : '#111', color: activeTab === 'products' ? '#000' : '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Товары</button>
        <button onClick={() => setActiveTab('orders')} style={{ padding: '10px 20px', background: activeTab === 'orders' ? 'var(--accent)' : '#111', color: activeTab === 'orders' ? '#000' : '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Заказы</button>
      </div>

      {renderTab()}
    </motion.div>
  );
}
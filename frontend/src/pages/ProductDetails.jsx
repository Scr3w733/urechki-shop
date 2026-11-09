import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus, Star, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    axios.get(`http://localhost:8080/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.log(err));
      
    axios.get('http://localhost:8080/api/products')
      .then(res => {
        // Берем похожие товары (исключая текущий)
        const filtered = res.data.filter(p => p.id.toString() !== id).slice(0, 4);
        setRelated(filtered);
      })
      .catch(err => console.log(err));
  }, [id]);

  if (!product) return <div style={{ padding: '100px', textAlign: 'center' }}>Загрузка...</div>;

  const handleBuyNow = () => {
    for(let i=0; i<quantity; i++) addToCart(product);
    setIsCartOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '80px 10%', minHeight: '80vh' }}>
      <Link to="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#d4af37', marginBottom: '40px', fontWeight: 'bold' }}>
        <ArrowLeft size={20} /> Назад в каталог
      </Link>
      
      <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap', marginBottom: '80px' }}>
        {/* Левая часть: Фото (Стикер) */}
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ flex: 1, minWidth: '300px', height: '500px', background: 'linear-gradient(135deg, #1e1e1e 0%, #111 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #444', fontSize: '12rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
           {product.category === 'Пиво' ? '🍻' : product.category === 'Закуски' ? '🍟' : '👕'}
        </motion.div>
        
        {/* Правая часть: Инфо */}
        <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ background: '#d4af37', color: '#000', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>ХИТ ПРОДАЖ</span>
            <div style={{ display: 'flex', color: '#d4af37' }}><Star fill="#d4af37" size={16}/><Star fill="#d4af37" size={16}/><Star fill="#d4af37" size={16}/><Star fill="#d4af37" size={16}/><Star fill="#d4af37" size={16}/></div>
          </div>

          <p style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>{product.category}</p>
          <h1 style={{ fontSize: '3.5rem', color: '#fff', margin: '10px 0 20px', lineHeight: '1.1' }}>{product.name}</h1>
          
          <div style={{ fontSize: '3rem', fontWeight: 900, color: '#d4af37', marginBottom: '30px' }}>
            {product.price} ₽
          </div>

          {/* Выбор количества */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
            <span style={{ color: '#ccc' }}>Количество:</span>
            <div style={{ display: 'flex', alignItems: 'center', background: '#111', border: '1px solid #333', borderRadius: '8px' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '10px 15px', cursor: 'pointer' }}><Minus size={18}/></button>
              <span style={{ color: '#fff', fontSize: '1.2rem', width: '40px', textAlign: 'center' }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '10px 15px', cursor: 'pointer' }}><Plus size={18}/></button>
            </div>
          </div>

          {/* Кнопки */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { for(let i=0; i<quantity; i++) addToCart(product); }} style={{ flex: 1, padding: '20px', background: 'transparent', border: '2px solid #d4af37', color: '#d4af37', fontSize: '1.1rem', fontWeight: 900, borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <ShoppingBag size={20} /> В КОРЗИНУ
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(212,175,55,0.5)' }} whileTap={{ scale: 0.95 }} onClick={handleBuyNow} style={{ flex: 1, padding: '20px', background: '#d4af37', color: '#000', fontSize: '1.1rem', fontWeight: 900, border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
              КУПИТЬ СЕЙЧАС
            </motion.button>
          </div>
        </div>
      </div>

      {/* ВКЛАДКИ */}
      <div style={{ marginBottom: '80px' }}>
        <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #333', marginBottom: '30px' }}>
          {['desc', 'comp', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'transparent', border: 'none', color: activeTab === tab ? '#d4af37' : '#888', fontSize: '1.2rem', fontWeight: 'bold', paddingBottom: '15px', borderBottom: activeTab === tab ? '2px solid #d4af37' : 'none', cursor: 'pointer', transition: '0.3s' }}>
              {tab === 'desc' ? 'Описание' : tab === 'comp' ? 'Состав и Производство' : 'Отзывы (12)'}
            </button>
          ))}
        </div>
        <div style={{ color: '#ccc', lineHeight: '1.8', fontSize: '1.1rem' }}>
          {activeTab === 'desc' && <p>{product.description}. Идеальный выбор для настоящих ценителей качества. Мы гарантируем свежесть и непревзойденный вкус в каждой партии.</p>}
          {activeTab === 'comp' && <p>Изготовлено из отборного сырья. Условия производства соответствуют высшим стандартам качества. Без ГМО и искусственных добавок.</p>}
          {activeTab === 'reviews' && <p>Алексей: "Отличная вещь, беру уже второй раз!" <br/><br/> Мария: "Очень довольна покупкой, рекомендую всем."</p>}
        </div>
      </div>

      {/* ПОХОЖИЕ ТОВАРЫ */}
      <h2 style={{ fontSize: '2.5rem', color: '#d4af37', marginBottom: '40px' }}>С этим также покупают</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {related.map((item, i) => (
          <motion.div key={item.id} whileHover={{ y: -10 }} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <Link to={`/product/${item.id}`}>
              <div style={{ height: '180px', background: '#111', borderRadius: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>
                {item.category === 'Пиво' ? '🍻' : item.category === 'Закуски' ? '🍟' : '👕'}
              </div>
            </Link>
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>{item.name}</h3>
            <p style={{ color: '#d4af37', fontWeight: 'bold', marginTop: '10px' }}>{item.price} ₽</p>
            <Link to={`/product/${item.id}`} style={{ marginTop: 'auto', paddingTop: '15px' }}>
              <button style={{ width: '100%', background: '#333', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Посмотреть</button>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
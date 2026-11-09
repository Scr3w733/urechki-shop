import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const getSticker = (category) => {
  if (category === 'Пиво') return '🍻';
  if (category === 'Закуски') return '🍟';
  if (category === 'Мерч') return '👕';
  if (category === 'Наборы') return '🎁';
  return '🛒';
};

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('Все');
  const { addToCart } = useCart();

  useEffect(() => {
    axios.get('http://localhost:8080/api/products')
      .then(res => setProducts(res.data))
      .catch(err => setProducts([{ id: 1, name: "Пиво", category: "Пиво", price: 150, description: "Лагер" }]));
  }, []);

  const categories = ['Все', 'Пиво', 'Закуски', 'Мерч', 'Наборы'];
  const filteredProducts = filter === 'Все' ? products : products.filter(p => p.category === filter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '80px 8%', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '4rem', color: '#d4af37', marginBottom: '40px', textAlign: 'center' }}>Наш Каталог</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '50px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <motion.button key={cat} onClick={() => setFilter(cat)} whileHover={{ scale: 1.05 }} style={{ padding: '12px 25px', borderRadius: '30px', border: '2px solid #d4af37', background: filter === cat ? '#d4af37' : 'transparent', color: filter === cat ? '#000' : '#d4af37', fontWeight: 'bold', cursor: 'pointer' }}>
            {cat}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
        {filteredProducts.map((product, i) => (
          <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} whileHover={{ y: -10 }} className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column' }}>
            <Link to={`/product/${product.id}`}>
              <div style={{ height: '220px', background: '#1e1e1e', borderRadius: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '6rem' }}>
                {getSticker(product.category)}
              </div>
            </Link>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '5px' }}>{product.name}</h3>
            <p style={{ color: '#d4af37', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase' }}>{product.category}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>{product.price} ₽</span>
              <motion.button onClick={() => addToCart(product)} whileHover={{ scale: 1.05 }} style={{ background: '#d4af37', color: '#000', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}>В КОРЗИНУ</motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
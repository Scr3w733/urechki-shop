import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Beer, Award, Gift, Percent, Star, Users, Map, Calendar, Ticket, Coffee, Zap, CreditCard, HelpCircle, MapPin, Briefcase, Bell, PhoneCall, Camera, Globe, Heart, ShoppingBag, Sun, Moon, Cloud, Umbrella, Smile, ThumbsUp, Eye, Lock, Unlock, Key, Settings, Wifi, Battery, Home as HomeIcon, Flag, Bookmark, Link as LinkIcon, Search, Download, Upload, Folder, File, Music, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { featuresData } from '../data/features';

const iconMap = { ShieldCheck, Truck, Beer, Award, Gift, Percent, Star, Users, Map, Calendar, Ticket, Coffee, Zap, CreditCard, HelpCircle, MapPin, Briefcase, Bell, PhoneCall, Camera, Globe, Heart, ShoppingBag, Sun, Moon, Cloud, Umbrella, Smile, ThumbsUp, Eye, Lock, Unlock, Key, Settings, Wifi, Battery, HomeIcon, Flag, Bookmark, LinkIcon, Search, Download, Upload, Folder, File, Music, Video };

const getSticker = (category) => {
  if (category === 'Пиво') return '🍻';
  if (category === 'Закуски') return '🍟';
  if (category === 'Мерч') return '👕';
  if (category === 'Наборы') return '🎁';
  return '🛒';
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    axios.get('http://localhost:8080/api/products')
      .then(res => setProducts(res.data))
      .catch(err => setProducts([{ id: 1, name: "Пиво Жигулевское", category: "Пиво", price: 150, description: "Классический лагер" }]));
  }, []);

  const scrollToCatalog = () => document.getElementById('catalog-section').scrollIntoView({ behavior: 'smooth' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      
      {/* HERO СЕКЦИЯ С ПАРЯЩИМИ ЭЛЕМЕНТАМИ */}
      <section style={{ padding: '150px 10%', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }} style={{ position: 'absolute', top: '20%', left: '10%', fontSize: '4rem', opacity: 0.3 }}>🍻</motion.div>
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: '20%', right: '15%', fontSize: '5rem', opacity: 0.3 }}>🍟</motion.div>

        <motion.h1 initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ fontSize: '5rem', fontWeight: 900, color: '#fff', textShadow: '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(212,175,55,0.5)', lineHeight: '1.1', position: 'relative', zIndex: 10 }}>
          ПИВО СВАРЕНОЕ <br/><span style={{ color: '#d4af37' }}>С ДУШОЙ</span>
        </motion.h1>
        <motion.p initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ fontSize: '1.5rem', color: '#ccc', marginTop: '30px', maxWidth: '800px', margin: '30px auto', position: 'relative', zIndex: 10 }}>
          Настоящий сибирский крафт из Новосибирска. От классического лагера до авторских закусок и эксклюзивного мерча.
        </motion.p>
        <motion.button onClick={scrollToCatalog} whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(212,175,55,0.8)' }} whileTap={{ scale: 0.95 }} style={{ background: '#d4af37', color: '#000', border: 'none', padding: '20px 50px', borderRadius: '50px', fontSize: '1.2rem', fontWeight: 900, cursor: 'pointer', marginTop: '20px', alignSelf: 'center', position: 'relative', zIndex: 10 }}>
          СМОТРЕТЬ КАТАЛОГ
        </motion.button>
      </section>

      <div className="marquee-container">
        <div className="marquee-content">СВАРЕНО В НОВОСИБИРСКЕ • ТОЛЬКО НАТУРАЛЬНЫЕ ИНГРЕДИЕНТЫ • У РЕЧУШКИ • ДОСТАВКА ПО ГОРОДУ • СКИДКИ ПОСТОЯННЫМ КЛИЕНТАМ •</div>
      </div>

      {/* ЭЛЕГАНТНЫЙ БЛОК СЕРВИСОВ */}
      <section style={{ padding: '100px 8%', textAlign: 'center', position: 'relative' }}>
        <h2 style={{ fontSize: '3rem', color: '#fff', marginBottom: '20px', fontWeight: 900 }}>Полезные сервисы</h2>
        <p style={{ color: '#aaa', marginBottom: '60px', fontSize: '1.1rem' }}>Всё для вашего комфорта в один клик</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' }}>
          {featuresData.map((btn) => {
            const IconComponent = iconMap[btn.icon] || Star; 
            
            return (
              <Link to={`/feature/${btn.id}`} key={btn.id}>
                <motion.div 
                  whileHover={{ y: -5, background: 'rgba(30, 30, 30, 0.9)', borderColor: '#d4af37' }} 
                  style={{ background: 'rgba(15, 15, 15, 0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '30px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', height: '100%', transition: 'all 0.3s' }}
                >
                  <div style={{ background: 'rgba(212,175,55,0.1)', padding: '15px', borderRadius: '15px' }}>
                    <IconComponent size={32} color="#d4af37" />
                  </div>
                  <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>{btn.title}</span>
                  <span style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', marginTop: 'auto' }}>Подробнее →</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* КАТАЛОГ ХИТОВ */}
      <section id="catalog-section" style={{ padding: '100px 10%' }}>
        <motion.h2 whileInView={{ x: 0, opacity: 1 }} initial={{ x: -50, opacity: 0 }} style={{ fontSize: '3rem', color: '#d4af37', marginBottom: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Хиты продаж
          <Link to="/catalog">
            <motion.button whileHover={{ scale: 1.05 }} style={{ background: 'transparent', border: '2px solid #d4af37', color: '#d4af37', padding: '10px 20px', borderRadius: '30px', fontSize: '1rem', cursor: 'pointer' }}>
              Весь каталог
            </motion.button>
          </Link>
        </motion.h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {products.slice(0, 6).map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -10 }} className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column' }}>
              <Link to={`/product/${product.id}`}>
                <div style={{ height: '220px', background: '#111', borderRadius: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '6rem' }}>
                  {getSticker(product.category)}
                </div>
              </Link>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '5px' }}>{product.name}</h3>
              <p style={{ color: '#d4af37', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase' }}>{product.category}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{product.price} ₽</span>
                <motion.button onClick={() => addToCart(product)} whileHover={{ scale: 1.05, backgroundColor: '#fff', color: '#000' }} style={{ background: '#d4af37', color: '#000', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}>
                  В КОРЗИНУ
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Minus, Star, ShoppingBag, Heart, MessageSquare, ShieldCheck, Truck, RefreshCcw, Share2, Link as LinkIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const names = ["Алексей", "Мария", "Дмитрий", "Ольга", "Сергей", "Анна", "Иван", "Елена", "Максим", "Татьяна"];
const texts = ["Отличное место! Пиво всегда свежее.", "Беру мерч уже второй раз.", "Лучший стаут в городе.", "Приятная атмосфера.", "Сухарики просто огонь.", "Крафт реально достойный."];

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const [copySuccess, setCopySuccess] = useState(false);
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, user } = useAuth();
  
  const [userReviews, setUserReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });

  const [mockReviews] = useState(() => {
    const seed = parseInt(id) || 1;
    return Array.from({ length: 3 }).map((_, i) => ({
      name: names[(seed + i) % names.length],
      text: texts[(seed + i * 2) % texts.length],
      rating: 5,
      date: `${10 + i} ноября 2026`
    }));
  });

  useEffect(() => {
    window.scrollTo(0, 0); // Скролл наверх при загрузке

    axios.get(`http://localhost:8080/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        const saved = JSON.parse(localStorage.getItem('urechki_recently_viewed') || '[]');
        const filtered = saved.filter(p => p.id !== res.data.id);
        const updated = [res.data, ...filtered].slice(0, 4);
        localStorage.setItem('urechki_recently_viewed', JSON.stringify(updated));
        setRecentlyViewed(filtered.slice(0, 4));
      })
      .catch(err => console.log(err));
      
    axios.get('http://localhost:8080/api/products')
      .then(res => setRelated(res.data.filter(p => p.id.toString() !== id).slice(0, 4)))
      .catch(err => console.log(err));

    const savedReviews = JSON.parse(localStorage.getItem(`urechki_reviews_${id}`) || '[]');
    setUserReviews(savedReviews);

    const handleScroll = () => {
      if (window.scrollY > 400) setShowStickyBar(true);
      else setShowStickyBar(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) return alert("Войдите, чтобы оставить отзыв!");
    const review = { name: user.name, text: newReview.text, rating: newReview.rating, date: new Date().toLocaleDateString() };
    const updated = [review, ...userReviews];
    setUserReviews(updated);
    localStorage.setItem(`urechki_reviews_${id}`, JSON.stringify(updated));
    setNewReview({ rating: 5, text: '' });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!product) return <div style={{ padding: '100px', textAlign: 'center', color: 'var(--accent)' }}>Загрузка...</div>;

  const allReviews = [...userReviews, ...mockReviews];
  const sticker = product.category === 'Пиво' ? '🍻' : product.category === 'Закуски' ? '🍟' : '👕';

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 'clamp(20px, 5vw, 80px) 5%', minHeight: '80vh', paddingBottom: '120px' }}>
      
      {/* ХЛЕБНЫЕ КРОШКИ */}
      <div style={{ display: 'flex', gap: '10px', color: '#888', fontSize: '0.9rem', marginBottom: '30px' }}>
        <Link to="/" style={{ hover: { color: 'var(--accent)' } }}>Главная</Link> <span>/</span>
        <Link to="/catalog">Каталог</Link> <span>/</span>
        <span style={{ color: 'var(--accent)' }}>{product.name}</span>
      </div>

      <Link to="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--accent)', marginBottom: '30px', fontWeight: 'bold' }}>
        <ArrowLeft size={20} /> Назад в каталог
      </Link>
      
      <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap', marginBottom: '80px' }}>
        {/* ЛЕВАЯ ЧАСТЬ: ФОТО */}
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ flex: 1, minWidth: '300px', height: 'clamp(300px, 50vh, 500px)', background: 'linear-gradient(135deg, #1e1e1e 0%, #111 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #444', fontSize: '12rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative' }}>
           {sticker}
           <button onClick={() => toggleWishlist(product)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
             <Heart size={24} fill={isInWishlist(product.id) ? '#ff4444' : 'transparent'} color={isInWishlist(product.id) ? '#ff4444' : '#fff'} />
           </button>
        </motion.div>
        
        {/* ПРАВАЯ ЧАСТЬ: ИНФО */}
        <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ background: 'var(--accent)', color: '#000', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>ХИТ ПРОДАЖ</span>
            <div style={{ display: 'flex', color: 'var(--accent)' }}><Star fill="var(--accent)" size={16}/><Star fill="var(--accent)" size={16}/><Star fill="var(--accent)" size={16}/><Star fill="var(--accent)" size={16}/><Star fill="var(--accent)" size={16}/></div>
          </div>
          
          <p style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>{product.category}</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#fff', margin: '10px 0 20px', lineHeight: '1.1' }}>{product.name}</h1>
          
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)', marginBottom: '20px' }}>{product.price} ₽</div>

          {/* ВЫБОР РАЗМЕРА (Для одежды) */}
          {product.category === 'Мерч' && (
            <div style={{ marginBottom: '30px' }}>
              <p style={{ color: '#ccc', marginBottom: '10px' }}>Выберите размер:</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['S', 'M', 'L', 'XL'].map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} style={{ width: '45px', height: '45px', borderRadius: '8px', background: selectedSize === size ? 'var(--accent)' : '#111', color: selectedSize === size ? '#000' : '#fff', border: '1px solid var(--accent)', fontWeight: 'bold', cursor: 'pointer' }}>{size}</button>
                ))}
              </div>
            </div>
          )}

          {/* КОЛИЧЕСТВО И КНОПКИ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#111', border: '1px solid #333', borderRadius: '8px' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '10px 15px', cursor: 'pointer' }}><Minus size={18}/></button>
              <span style={{ color: '#fff', fontSize: '1.2rem', width: '40px', textAlign: 'center' }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '10px 15px', cursor: 'pointer' }}><Plus size={18}/></button>
            </div>
            
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { for(let i=0; i<quantity; i++) addToCart({...product, name: product.category === 'Мерч' ? `${product.name} (Размер: ${selectedSize})` : product.name}); }} style={{ flex: 1, padding: '20px', background: 'var(--accent)', color: '#000', fontSize: '1.1rem', fontWeight: 900, border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <ShoppingBag size={20} /> ДОБАВИТЬ В КОРЗИНУ
            </motion.button>
          </div>

          {/* БЕЙДЖИ ДОВЕРИЯ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#111', padding: '15px 10px', borderRadius: '10px', textAlign: 'center' }}>
              <Truck size={24} color="var(--accent)" style={{ marginBottom: '5px' }} />
              <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Доставка за 1-2 часа</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#111', padding: '15px 10px', borderRadius: '10px', textAlign: 'center' }}>
              <ShieldCheck size={24} color="var(--accent)" style={{ marginBottom: '5px' }} />
              <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Безопасная оплата</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#111', padding: '15px 10px', borderRadius: '10px', textAlign: 'center' }}>
              <RefreshCcw size={24} color="var(--accent)" style={{ marginBottom: '5px' }} />
              <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Гарантия качества</span>
            </div>
          </div>

          {/* СОЦИАЛЬНЫЕ СЕТИ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#aaa', fontSize: '0.9rem' }}><Share2 size={16} style={{ display: 'inline', verticalAlign: 'middle' }}/> Поделиться:</span>
            <button onClick={copyLink} style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
               {copySuccess ? <Check size={14} color="var(--accent)"/> : <LinkIcon size={14} />} {copySuccess ? 'Скопировано!' : 'Копировать ссылку'}
            </button>
          </div>

        </div>
      </div>

      {/* ВКЛАДКИ (ОПИСАНИЕ, СОСТАВ, ОТЗЫВЫ) */}
      <div style={{ marginBottom: '80px' }}>
        <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #333', marginBottom: '30px', overflowX: 'auto' }}>
          {['desc', 'comp', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'transparent', border: 'none', color: activeTab === tab ? 'var(--accent)' : '#888', fontSize: '1.1rem', fontWeight: 'bold', padding: '0 0 15px 0', borderBottom: activeTab === tab ? '2px solid var(--accent)' : 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {tab === 'desc' ? 'Описание' : tab === 'comp' ? 'Состав' : `Отзывы (${allReviews.length})`}
            </button>
          ))}
        </div>
        
        <div style={{ color: '#ccc', lineHeight: '1.8', fontSize: '1.1rem' }}>
          {activeTab === 'desc' && <p>{product.description}. Наша продукция проходит строгий контроль качества. Это идеальный выбор как для повседневного ужина, так и для шумной вечеринки с друзьями. Попробуйте и вы поймете, почему нас выбирают!</p>}
          {activeTab === 'comp' && (
            <div>
              <h3 style={{ color: '#fff', marginBottom: '10px' }}>Из чего это сделано?</h3>
              <p>Мы используем только натуральные ингредиенты. В составе нет ГМО, искусственных красителей и усилителей вкуса. Продукт соответствует всем стандартам ГОСТ и СанПиН.</p>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Форма добавления отзыва */}
              <div style={{ background: '#111', padding: '20px', borderRadius: '10px', border: '1px solid #333' }}>
                <h3 style={{ color: '#fff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}><MessageSquare size={20} color="var(--accent)"/> Оставить отзыв</h3>
                {user ? (
                  <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#aaa' }}>Ваша оценка:</span>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={24} style={{ cursor: 'pointer' }} fill={star <= newReview.rating ? 'var(--accent)' : 'transparent'} color="var(--accent)" onClick={() => setNewReview({...newReview, rating: star})} />
                      ))}
                    </div>
                    <textarea required placeholder="Поделитесь впечатлениями о продукте..." value={newReview.text} onChange={e => setNewReview({...newReview, text: e.target.value})} style={{ width: '100%', padding: '15px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', minHeight: '80px', outline: 'none', resize: 'vertical' }} />
                    <button type="submit" style={{ background: 'var(--accent)', color: '#000', padding: '12px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-start' }}>Отправить</button>
                  </form>
                ) : (
                  <p style={{ color: '#aaa' }}>Пожалуйста, войдите в аккаунт, чтобы оставить отзыв.</p>
                )}
              </div>

              {/* Список отзывов */}
              {allReviews.map((rev, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '10px', borderLeft: '3px solid var(--accent)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ color: '#fff' }}>{rev.name}</strong>
                    <span style={{ color: 'var(--accent)' }}>{'★'.repeat(rev.rating)}</span>
                  </div>
                  <p style={{ color: '#aaa', fontStyle: 'italic', marginBottom: '10px' }}>"{rev.text}"</p>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>{rev.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ПОХОЖИЕ ТОВАРЫ */}
      <div style={{ marginTop: '60px', borderTop: '1px solid #333', paddingTop: '40px' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--accent)', marginBottom: '30px' }}>Часто покупают вместе</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {related.map((item) => (
            <Link key={item.id} to={`/product/${item.id}`}>
              <motion.div whileHover={{ y: -5 }} className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '150px', background: '#111', borderRadius: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                  {item.category === 'Пиво' ? '🍻' : item.category === 'Закуски' ? '🍟' : '👕'}
                </div>
                <h3 style={{ fontSize: '1rem', color: '#fff' }}>{item.name}</h3>
                <p style={{ color: 'var(--accent)', fontWeight: 'bold', marginTop: '5px' }}>{item.price} ₽</p>
              </motion.div>
            </Link>
          ))}
          
        </div>
      </div>



      {/* STICKY ПАНЕЛЬ (Прилипающая кнопка) */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(15px)', borderTop: '1px solid var(--accent)', padding: '15px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 9999, boxShadow: '0 -5px 20px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '2rem' }}>{sticker}</div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1rem', display: window.innerWidth > 768 ? 'block' : 'none' }}>{product.name}</h3>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.2rem' }}>{product.price} ₽</span>
              </div>
            </div>
            <button onClick={() => addToCart(product)} style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '12px 30px', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingBag size={20} /> В КОРЗИНУ
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
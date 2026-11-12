import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Beer,
  Star,
  TrendingUp,
  ArrowRight,
  Timer,
  Zap,
  Mail,
  ShieldCheck,
  Truck,
  Gift,
  Heart,
  Users,
  Award,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  ChevronRight,
  ThumbsUp,
  Package,
  CreditCard,
  RefreshCw,
  Percent,
  MessageSquare,
  Instagram,
  Send,
  CheckCircle,
  PlayCircle,
  Globe,
  Coffee,
  Music,
  Camera,
  Sun,
  Moon,
  Cloud,
  Umbrella
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// ============================================================
// БЛОК 1: ДАННЫЕ ДЛЯ БАННЕРОВ
// ============================================================
const banners = [
  {
    id: 1,
    title: "Скидка 20% на крафт",
    subtitle: "Только сегодня! Успей затариться вкусным пивом по акции.",
    color: "linear-gradient(135deg, #8b0000, #d4af37)",
    link: "/catalog",
    btnText: "Перейти в каталог"
  },
  {
    id: 2,
    title: "Новинки сезона",
    subtitle: "Попробуй наш свежий IPA с нотками цитруса.",
    color: "linear-gradient(135deg, #004d00, #00ff41)",
    link: "/catalog",
    btnText: "Смотреть новинки"
  },
  {
    id: 3,
    title: "Мерч для своих",
    subtitle: "Создай футболку мечты в нашем конструкторе.",
    color: "linear-gradient(135deg, #1a237e, #00d2ff)",
    link: "/merch",
    btnText: "Открыть конструктор"
  }
];

// ============================================================
// БЛОК 2: ДАННЫЕ ДЛЯ НАСТРОЕНИЙ
// ============================================================
const moods = [
  { id: 'relax', label: 'Расслабиться', emoji: '🌙', filter: 'Пиво' },
  { id: 'party', label: 'Вечеринка', emoji: '🎉', filter: 'Наборы' },
  { id: 'food', label: 'К пицце', emoji: '🍕', filter: 'Закуски' },
  { id: 'gift', label: 'В подарок', emoji: '🎁', filter: 'Наборы' },
  { id: 'sport', label: 'Спорт', emoji: '⚽', filter: 'Мерч' }
];

// ============================================================
// БЛОК 3: ДАННЫЕ ДЛЯ ПРЕИМУЩЕСТВ
// ============================================================
const advantages = [
  { 
    icon: <Truck size={40} color="var(--accent)" />, 
    title: 'Быстрая доставка', 
    desc: 'За 1-2 часа по городу' 
  },
  { 
    icon: <ShieldCheck size={40} color="var(--accent)" />, 
    title: 'Гарантия качества', 
    desc: '100% свежесть' 
  },
  { 
    icon: <Gift size={40} color="var(--accent)" />, 
    title: 'Бонусы', 
    desc: '10% с каждой покупки' 
  },
  { 
    icon: <CreditCard size={40} color="var(--accent)" />, 
    title: 'Удобная оплата', 
    desc: 'Карта, СБП, наличные' 
  },
  { 
    icon: <RefreshCw size={40} color="var(--accent)" />, 
    title: 'Легкий возврат', 
    desc: 'Без лишних вопросов' 
  },
  { 
    icon: <Percent size={40} color="var(--accent)" />, 
    title: 'Скидки', 
    desc: 'Постоянным клиентам' 
  }
];

// ============================================================
// БЛОК 4: ДАННЫЕ ДЛЯ КАТЕГОРИЙ
// ============================================================
const categories = [
  { name: 'Пиво', emoji: '🍻', path: '/catalog?search=Пиво', color: '#d4af37' },
  { name: 'Закуски', emoji: '🍟', path: '/catalog?search=Закуски', color: '#ff6b35' },
  { name: 'Мерч', emoji: '👕', path: '/merch', color: '#00d2ff' },
  { name: 'Наборы', emoji: '🎁', path: '/catalog?search=Наборы', color: '#ff007f' },
  { name: 'Сертификаты', emoji: '📜', path: '/catalog?search=Сертификаты', color: '#44ff44' }
];

// ============================================================
// БЛОК 5: ДАННЫЕ ДЛЯ СТАТИСТИКИ
// ============================================================
const stats = [
  { icon: <Package size={30} color="var(--accent)" />, value: '5420+', label: 'Заказов' },
  { icon: <Users size={30} color="var(--accent)" />, value: '1250+', label: 'Клиентов' },
  { icon: <Beer size={30} color="var(--accent)" />, value: '40', label: 'Сортов пива' },
  { icon: <Star size={30} color="var(--accent)" />, value: '4.9', label: 'Рейтинг' }
];

// ============================================================
// БЛОК 6: ДАННЫЕ ДЛЯ ОТЗЫВОВ
// ============================================================
const reviews = [
  { 
    name: 'Алексей', 
    text: 'Лучшее пиво в городе! Доставили за час, всё свежее и холодное.', 
    rating: 5, 
    avatar: '👨',
    date: '12 Ноября 2026'
  },
  { 
    name: 'Мария', 
    text: 'Мерч просто огонь. Футболка сидит идеально, качество ткани супер.', 
    rating: 5, 
    avatar: '👩',
    date: '10 Ноября 2026'
  },
  { 
    name: 'Дмитрий', 
    text: 'Постоянно заказываю, скидки радуют. Крафт реально достойный.', 
    rating: 5, 
    avatar: '🧑',
    date: '08 Ноября 2026'
  },
  { 
    name: 'Ольга', 
    text: 'Отличный сервис. Курьер вежливый, пиво холодное, закуски свежие.', 
    rating: 5, 
    avatar: '👩‍🦰',
    date: '05 Ноября 2026'
  },
  { 
    name: 'Сергей', 
    text: 'Крафт реально достойный. IPA зашел на ура, беру еще.', 
    rating: 5, 
    avatar: '👨‍🦱',
    date: '03 Ноября 2026'
  },
  { 
    name: 'Анна', 
    text: 'Заказывала набор в подарок мужу. Остались довольны, красивая упаковка!', 
    rating: 5, 
    avatar: '👱‍♀️',
    date: '01 Ноября 2026'
  }
];

// ============================================================
// БЛОК 7: ДАННЫЕ ДЛЯ ПАРТНЕРОВ
// ============================================================
const partners = [
  { name: 'Sber' },
  { name: 'Tinkoff' },
  { name: 'Yandex' },
  { name: 'VK' },
  { name: 'Ozon' },
  { name: 'Wildberries' }
];

// ============================================================
// БЛОК 8: ДАННЫЕ ДЛЯ FAQ
// ============================================================
const faqs = [
  { q: 'Как быстро доставка?', a: '1-2 часа по Новосибирску.' },
  { q: 'Есть ли бонусы?', a: 'Да, 10% от каждой покупки.' },
  { q: 'Можно оплатить картой?', a: 'Конечно, через СБП или картой.' },
  { q: 'Какой минимальный заказ?', a: 'От 500 рублей.' },
  { q: 'Работаете ли вы ночью?', a: 'Мы работаем до 23:00.' },
  { q: 'Можно вернуть товар?', a: 'Да, в течение 14 дней.' }
];

// ============================================================
// БЛОК 9: ДАННЫЕ ДЛЯ ГАЛЕРЕИ
// ============================================================
const gallery = [
  { id: 1, emoji: '🍻', title: 'Пивной вечер' },
  { id: 2, emoji: '🍟', title: 'Закуски' },
  { id: 3, emoji: '👕', title: 'Мерч' },
  { id: 4, emoji: '🎁', title: 'Наборы' },
  { id: 5, emoji: '🍕', title: 'Пицца' },
  { id: 6, emoji: '🍺', title: 'Крафт' },
  { id: 7, emoji: '🥨', title: 'К пиву' },
  { id: 8, emoji: '🧀', title: 'Сыры' }
];

// ============================================================
// БЛОК 10: ДАННЫЕ ДЛЯ БЛОГА
// ============================================================
const blogPreviews = [
  { id: 1, title: 'История сибирского пивоварения', img: '🏭', date: '12 Ноября' },
  { id: 2, title: 'Как правильно дегустировать пиво', img: '🍺', date: '10 Ноября' },
  { id: 3, title: 'С чем сочетать разные сорта', img: '🍽️', date: '05 Ноября' }
];

// ============================================================
// БЛОК 11: ДАННЫЕ ДЛЯ ЛОКАЦИЙ
// ============================================================
const locations = [
  { title: 'Главный филиал', addr: 'ул. 2-я Воинская, 53' },
  { title: 'На Ленина', addr: 'ул. Ленина, 10' },
  { title: 'На Красном', addr: 'Красный проспект, 50' },
  { title: 'На Кирова', addr: 'ул. Кирова, 27' }
];

// ============================================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ СТИКЕРОВ
// ============================================================
const getSticker = (cat) => {
  if (cat === 'Пиво') return '🍻';
  if (cat === 'Закуски') return '🍟';
  if (cat === 'Мерч') return '👕';
  if (cat === 'Наборы') return '🎁';
  return '📜';
};

// ============================================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================================
export default function Home() {
  const [products, setProducts] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [selectedMood, setSelectedMood] = useState(moods[0]);
  const [activeFaq, setActiveFaq] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    axios.get('http://localhost:8080/api/products')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));

    const bannerTimer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);

    const clockTimer = setInterval(() => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end - now;
      setTimeLeft({
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60)
      });
    }, 1000);

    return () => {
      clearInterval(bannerTimer);
      clearInterval(clockTimer);
    };
  }, []);

  const filteredByMood = products.filter(p => p.category === selectedMood.filter).slice(0, 4);
  const bestsellers = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ paddingBottom: '60px', overflowX: 'hidden' }}
    >
      {/* ========================================== */}
      {/* СЕКЦИЯ 1: ГЛАВНЫЙ БАННЕР (КАРУСЕЛЬ) */}
      {/* ========================================== */}
      <section style={{ position: 'relative', height: '420px', margin: '20px 5%', borderRadius: '25px', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: banners[currentBanner].color,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 10%',
            }}
          >
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                color: '#fff',
                fontWeight: 900,
                marginBottom: '15px',
                lineHeight: '1.1',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              {banners[currentBanner].title}
            </motion.h1>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: '1.3rem',
                color: '#eee',
                marginBottom: '30px'
              }}
            >
              {banners[currentBanner].subtitle}
            </motion.p>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link to={banners[currentBanner].link}>
                <button
                  style={{
                    background: '#fff',
                    color: '#000',
                    padding: '15px 35px',
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.2)'
                  }}
                >
                  {banners[currentBanner].btnText}
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Точки навигации */}
        <div
          style={{
            position: 'absolute',
            bottom: '25px',
            left: '10%',
            display: 'flex',
            gap: '10px',
            zIndex: 10
          }}
        >
          {banners.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentBanner(i)}
              style={{
                width: currentBanner === i ? '30px' : '10px',
                height: '10px',
                borderRadius: '5px',
                background: currentBanner === i ? '#fff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: '0.3s'
              }}
            />
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 2: БЕГУЩАЯ СТРОКА */}
      {/* ========================================== */}
      <div className="marquee-container" style={{ marginTop: '30px' }}>
        <div className="marquee-content">
          <span>СВАРЕНО В НОВОСИБИРСКЕ • ТОЛЬКО НАТУРАЛЬНЫЕ ИНГРЕДИЕНТЫ • У РЕЧУШКИ • ДОСТАВКА ПО ГОРОДУ • СКИДКИ ПОСТОЯННЫМ КЛИЕНТАМ • </span>
          <span>СВАРЕНО В НОВОСИБИРСКЕ • ТОЛЬКО НАТУРАЛЬНЫЕ ИНГРЕДИЕНТЫ • У РЕЧУШКИ • ДОСТАВКА ПО ГОРОДУ • СКИДКИ ПОСТОЯННЫМ КЛИЕНТАМ • </span>
        </div>
      </div>

      {/* ========================================== */}
      {/* СЕКЦИЯ 3: ПРЕИМУЩЕСТВА */}
      {/* ========================================== */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '40px 5%' }}>
        {advantages.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel"
            style={{
              padding: '25px 15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '10px'
            }}
          >
            {item.icon}
            <h4 style={{ color: '#fff', fontSize: '1rem' }}>{item.title}</h4>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 4: КАТЕГОРИИ */}
      {/* ========================================== */}
      <section style={{ padding: '40px 5%' }}>
        <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles color="var(--accent)" /> Выбери категорию
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          {categories.map((cat, i) => (
            <Link key={i} to={cat.path} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-panel"
                style={{
                  padding: '25px 15px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderColor: cat.color
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{cat.emoji}</div>
                <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>{cat.name}</h4>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 5: СДЕЛКА ДНЯ (ТАЙМЕР) */}
      {/* ========================================== */}
      <section style={{ padding: '40px 5%' }}>
        <div
          className="glass-panel"
          style={{
            padding: '30px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '2px solid var(--accent)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Zap size={40} color="var(--accent)" />
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.5rem' }}>Сделка дня</h3>
              <p style={{ color: '#aaa' }}>Скидка 20% на всю категорию</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Timer size={20} color="var(--accent)" />
            <div style={{ display: 'flex', gap: '8px', fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
              <span style={{ background: '#000', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--accent)' }}>
                {String(timeLeft.h).padStart(2, '0')}
              </span>
              <span style={{ color: 'var(--accent)' }}>:</span>
              <span style={{ background: '#000', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--accent)' }}>
                {String(timeLeft.m).padStart(2, '0')}
              </span>
              <span style={{ color: 'var(--accent)' }}>:</span>
              <span style={{ background: '#000', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--accent)' }}>
                {String(timeLeft.s).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 6: ВЫБОР НАСТРОЕНИЯ */}
      {/* ========================================== */}
      <section style={{ padding: '40px 5%' }}>
        <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Heart color="var(--accent)" /> Подбери под настроение
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
          {moods.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMood(m)}
              style={{
                background: selectedMood.id === m.id ? 'var(--accent)' : '#111',
                color: selectedMood.id === m.id ? '#000' : '#fff',
                border: '1px solid var(--accent)',
                padding: '12px 20px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: '0.3s'
              }}
            >
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {filteredByMood.length === 0 ? (
            <p style={{ color: '#888', gridColumn: '1 / -1' }}>Товары загружаются...</p>
          ) : (
            filteredByMood.map(product => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className="glass-panel"
                style={{ padding: '15px' }}
              >
                <div
                  style={{
                    height: '150px',
                    background: '#111',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '5rem',
                    marginBottom: '15px'
                  }}
                >
                  {getSticker(product.category)}
                </div>
                <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '5px' }}>{product.name}</h3>
                <p style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>
                  {product.price} ₽
                </p>
                <button
                  onClick={() => addToCart(product)}
                  style={{
                    width: '100%',
                    background: 'var(--accent)',
                    color: '#000',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  В корзину
                </button>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 7: ХИТЫ ПРОДАЖ */}
      {/* ========================================== */}
      <section style={{ padding: '40px 5%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp color="var(--accent)" /> Хиты продаж
          </h2>
          <Link to="/catalog" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
            Все товары <ArrowRight size={18} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {bestsellers.map(product => (
            <motion.div
              key={product.id}
              whileHover={{ y: -5 }}
              className="glass-panel"
              style={{ padding: '15px', position: 'relative' }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '15px',
                  left: '15px',
                  background: 'var(--accent)',
                  color: '#000',
                  fontSize: '0.7rem',
                  padding: '3px 10px',
                  borderRadius: '15px',
                  fontWeight: 'bold'
                }}
              >
                TOP
              </div>
              <div
                style={{
                  height: '150px',
                  background: '#111',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '5rem',
                  marginBottom: '15px'
                }}
              >
                {getSticker(product.category)}
              </div>
              <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '5px' }}>{product.name}</h3>
              <p style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>
                {product.price} ₽
              </p>
              <button
                onClick={() => addToCart(product)}
                style={{
                  width: '100%',
                  background: 'var(--accent)',
                  color: '#000',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                В корзину
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 8: НОВИНКИ */}
      {/* ========================================== */}
      {newArrivals.length > 0 && (
        <section style={{ padding: '40px 5%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles color="var(--accent)" /> Новинки
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {newArrivals.map(product => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className="glass-panel"
                style={{ padding: '15px', position: 'relative' }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    background: '#00ff41',
                    color: '#000',
                    fontSize: '0.7rem',
                    padding: '3px 10px',
                    borderRadius: '15px',
                    fontWeight: 'bold'
                  }}
                >
                  NEW
                </div>
                <div
                  style={{
                    height: '150px',
                    background: '#111',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '5rem',
                    marginBottom: '15px'
                  }}
                >
                  {getSticker(product.category)}
                </div>
                <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '5px' }}>{product.name}</h3>
                <p style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>
                  {product.price} ₽
                </p>
                <button
                  onClick={() => addToCart(product)}
                  style={{
                    width: '100%',
                    background: 'var(--accent)',
                    color: '#000',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  В корзину
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* СЕКЦИЯ 9: СТАТИСТИКА */}
      {/* ========================================== */}
      <section style={{ padding: '60px 5%', background: 'linear-gradient(135deg, rgba(212,175,55,0.1), transparent)' }}>
        <h2 style={{ fontSize: '2rem', color: '#fff', textAlign: 'center', marginBottom: '40px' }}>Мы в цифрах</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', textAlign: 'center' }}>
          {stats.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>{item.icon}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)' }}>{item.value}</div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>{item.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 10: ПОЧЕМУ МЫ */}
      {/* ========================================== */}
      <section style={{ padding: '40px 5%' }}>
        <h2 style={{ fontSize: '2rem', color: '#fff', textAlign: 'center', marginBottom: '40px' }}>Почему выбирают нас</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {[
            { icon: '🍺', title: 'Свое производство', desc: 'Варим сами, без посредников' },
            { icon: '🏆', title: 'Награды', desc: 'Победители конкурсов крафта' },
            { icon: '⚡', title: 'Скорость', desc: 'Доставка за 1-2 часа' },
            { icon: '💎', title: 'Премиум-качество', desc: 'Только отборное сырье' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-panel"
              style={{ padding: '30px', textAlign: 'center' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{item.icon}</div>
              <h3 style={{ color: '#fff', marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 11: ОТЗЫВЫ */}
      {/* ========================================== */}
      <section style={{ padding: '40px 5%' }}>
        <h2 style={{ fontSize: '2rem', color: '#fff', textAlign: 'center', marginBottom: '40px' }}>Отзывы</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {reviews.map((rev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel"
              style={{ padding: '25px', borderLeft: '4px solid var(--accent)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ fontSize: '2.5rem' }}>{rev.avatar}</div>
                <div>
                  <h4 style={{ color: '#fff' }}>{rev.name}</h4>
                  <div style={{ display: 'flex', color: 'var(--accent)' }}>{'★'.repeat(rev.rating)}</div>
                </div>
              </div>
              <p style={{ color: '#aaa', fontStyle: 'italic', marginBottom: '10px' }}>"{rev.text}"</p>
              <span style={{ color: '#666', fontSize: '0.8rem' }}>{rev.date}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 12: ПАРТНЕРЫ */}
      {/* ========================================== */}
      <section style={{ padding: '40px 5%', textAlign: 'center' }}>
        <h3 style={{ color: '#666', fontSize: '1rem', marginBottom: '20px', letterSpacing: '3px' }}>НАМ ДОВЕРЯЮТ</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', opacity: 0.5 }}>
          {partners.map((partner, i) => (
            <div key={i} style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>{partner.name}</div>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 13: FAQ */}
      {/* ========================================== */}
      <section style={{ padding: '40px 5%' }}>
        <h2 style={{ fontSize: '2rem', color: '#fff', textAlign: 'center', marginBottom: '30px' }}>Частые вопросы</h2>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {faqs.map((item, i) => (
            <div key={i} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                style={{
                  width: '100%',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {item.q}
                <ChevronRight
                  size={20}
                  style={{
                    transform: activeFaq === i ? 'rotate(90deg)' : 'rotate(0)',
                    transition: '0.3s',
                    color: 'var(--accent)'
                  }}
                />
              </button>
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 20px 20px', color: '#aaa' }}>{item.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 14: ГАЛЕРЕЯ */}
      {/* ========================================== */}
      <section style={{ padding: '40px 5%' }}>
        <h2 style={{ fontSize: '2rem', color: '#fff', textAlign: 'center', marginBottom: '40px' }}>Галерея</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          {gallery.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05 }}
              className="glass-panel"
              style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{item.emoji}</div>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{item.title}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 15: БЛОГ */}
      {/* ========================================== */}
      <section style={{ padding: '40px 5%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare color="var(--accent)" /> Блог
          </h2>
          <Link to="/blog" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
            Все статьи <ArrowRight size={18} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {blogPreviews.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ y: -5 }} className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '15px', textAlign: 'center' }}>{post.img}</div>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '10px' }}>{post.title}</h3>
                <p style={{ color: '#888', fontSize: '0.85rem' }}>{post.date}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 16: ПОДПИСКА */}
      {/* ========================================== */}
      <section style={{ padding: '60px 5%' }}>
        <div
          className="glass-panel"
          style={{
            padding: '50px 30px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.15), transparent)',
            border: '1px solid var(--accent)'
          }}
        >
          <Mail size={50} color="var(--accent)" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '10px' }}>Будь в курсе</h2>
          <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '1.1rem' }}>
            Подпишись и получи промокод на 500 рублей
          </p>
          <div
            style={{
              display: 'flex',
              maxWidth: '500px',
              margin: '0 auto',
              background: '#111',
              borderRadius: '30px',
              padding: '5px',
              border: '1px solid #333'
            }}
          >
            <input
              type="email"
              placeholder="Ваш Email"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                padding: '15px',
                color: '#fff',
                outline: 'none'
              }}
            />
            <button
              style={{
                background: 'var(--accent)',
                color: '#000',
                border: 'none',
                padding: '0 30px',
                borderRadius: '25px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Подписаться
            </button>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 17: ФИЛИАЛЫ */}
      {/* ========================================== */}
      <section style={{ padding: '40px 5%' }}>
        <h2 style={{ fontSize: '2rem', color: '#fff', textAlign: 'center', marginBottom: '40px' }}>Наши филиалы</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {locations.map((loc, i) => (
            <div key={i} className="glass-panel" style={{ padding: '25px', textAlign: 'center' }}>
              <MapPin size={30} color="var(--accent)" style={{ margin: '0 auto 15px' }} />
              <h4 style={{ color: '#fff', marginBottom: '10px' }}>{loc.title}</h4>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{loc.addr}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 18: ПРИЛОЖЕНИЕ */}
      {/* ========================================== */}
      <section style={{ padding: '40px 5%' }}>
        <Link to="/app" style={{ textDecoration: 'none' }}>
          <div
            className="glass-panel"
            style={{
              padding: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '30px',
              flexWrap: 'wrap',
              background: 'linear-gradient(135deg, #000, #1a1a1a)'
            }}
          >
            <div style={{ fontSize: '5rem' }}>📱</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '10px' }}>Скачай приложение</h2>
              <p style={{ color: '#aaa' }}>Скидка 10% на первый заказ в приложении</p>
            </div>
            <button
              style={{
                background: 'var(--accent)',
                color: '#000',
                padding: '15px 30px',
                borderRadius: '30px',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Подробнее
            </button>
          </div>
        </Link>
      </section>

      {/* ========================================== */}
      {/* СЕКЦИЯ 19: КОНТАКТЫ */}
      {/* ========================================== */}
      <section style={{ padding: '40px 5%', borderTop: '1px solid #222', marginTop: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <MapPin color="var(--accent)" size={30} />
            <div>
              <p style={{ color: '#fff', fontWeight: 'bold' }}>Адрес</p>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>ул. 2-я Воинская, 53</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Phone color="var(--accent)" size={30} />
            <div>
              <p style={{ color: '#fff', fontWeight: 'bold' }}>Телефон</p>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>+7 (951) 624-01-61</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Clock color="var(--accent)" size={30} />
            <div>
              <p style={{ color: '#fff', fontWeight: 'bold' }}>Режим работы</p>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>Ежедневно 11:00-23:00</p>
            </div>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Star, ShieldCheck, Truck, Gift, MapPin, Phone, Users } from 'lucide-react';
import InfoModal from '../components/InfoModal';

const prodButtonsData = [
  { id: 1, icon: <Star size={30}/>, text: "Наш Завод", info: "Фабрика расположена по адресу ул. Станционная, 60. Площадь 2500 кв.м. Оборудование из Германии и Чехии." },
  { id: 2, icon: <ShieldCheck size={30}/>, text: "Стандарты качества", info: "Проходим сертификацию ISO 22000. Каждая партия проверяется в лаборатории на микробиологию." },
  { id: 3, icon: <Truck size={30}/>, text: "Безотходное пр-во", info: "Пивная дробина отправляется на корм скоту местным фермерам, а CO2 улавливается и используется повторно." },
  { id: 4, icon: <Gift size={30}/>, text: "Сырье", info: "Используем сибирский ячмень и хмель из Чувашии и Германии. Никаких порошковых концентратов." },
  { id: 5, icon: <Star size={30}/>, text: "Лаборатория", info: "В штате два технолога-пивовара, которые ежедневно контролируют плотность сусла и вкус." },
  { id: 6, icon: <ShieldCheck size={30}/>, text: "Контроль дрожжей", info: "Ведем собственный банк чистых культур дрожжей. Каждый штамм хранится при температуре -80°C." },
  { id: 7, icon: <MapPin size={30}/>, text: "Розлив", info: "Линия розлива в стекло и ПЭТ. Автоматическая мойка и наполнение под давлением, чтобы избежать окисления." },
  { id: 8, icon: <Phone size={30}/>, text: "Температурный режим", info: "Брожение проходит при строго заданной температуре (от 8 до 20°C в зависимости от сорта) в цилиндро-конических танках." },
  { id: 9, icon: <Users size={30}/>, text: "Водоподготовка", info: "Используем артезианскую воду из скважины глубиной 120 метров. Многоступенчатая фильтрация и УФ-обеззараживание." },
  { id: 10, icon: <Star size={30}/>, text: "Автоматизация", info: "Процессом варки управляет компьютер Siemens. Человеческий фактор сведен к минимуму." },
];

export default function Production() {
  const [products, setProducts] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [modalInfo, setModalInfo] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8080/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  }, []);

  const categories = [...new Set(products.map(p => p.category))];

  const getComposition = (category) => {
    if (category === 'Пиво') return { ing: 'Вода, солод, хмель, дрожжи.', cond: 'Брожение в стальных танках при 18°C.' };
    if (category === 'Закуски') return { ing: 'Натуральные специи, соль, мука, мясо/рыба.', cond: 'Обжарка при 180°C, сушка 4 часа, вакуумная упаковка.' };
    if (category === 'Мерч') return { ing: '100% хлопок / металл / керамика.', cond: 'Дочернее производство в Шанхае. Ручная шелкография.' };
    return { ing: 'Смешанный состав.', cond: 'Соблюдение стандартов качества.' };
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '80px 10%', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '4rem', color: '#d4af37', textAlign: 'center', marginBottom: '20px' }}>Наше Производство</h1>
      <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '60px', fontSize: '1.2rem' }}>Узнайте, из чего и как создаются все наши продукты</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '80px' }}>
        {prodButtonsData.map((btn) => (
          <motion.div key={btn.id} onClick={() => setModalInfo(btn)} whileHover={{ y: -5, background: 'rgba(212,175,55,0.15)' }} className="glass-panel" style={{ padding: '20px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#d4af37' }}>
            {btn.icon}
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center' }}>{btn.text}</span>
          </motion.div>
        ))}
      </div>

      <InfoModal isOpen={!!modalInfo} onClose={() => setModalInfo(null)} title={modalInfo?.text} text={modalInfo?.info} />

      {categories.map(category => (
        <div key={category} style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#d4af37', marginBottom: '20px', borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '10px' }}>{category}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {products.filter(p => p.category === category).map((item) => (
              <motion.div key={item.id} className="glass-panel" style={{ padding: '15px 25px', borderRadius: '10px' }}>
                <div onClick={() => setOpenId(openId === item.id ? null : item.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>{item.name}</h3>
                  {openId === item.id ? <ChevronUp color="#d4af37" /> : <ChevronDown color="#d4af37" />}
                </div>
                
                <AnimatePresence>
                  {openId === item.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ paddingTop: '15px', marginTop: '15px', borderTop: '1px solid #333', display: 'grid', gap: '10px' }}>
                        <div>
                          <strong style={{ color: '#d4af37', fontSize: '0.9rem' }}>Состав:</strong>
                          <p style={{ color: '#ccc', marginTop: '5px', fontSize: '0.95rem' }}>{getComposition(item.category).ing}</p>
                        </div>
                        <div>
                          <strong style={{ color: '#d4af37', fontSize: '0.9rem' }}>Условия производства:</strong>
                          <p style={{ color: '#ccc', marginTop: '5px', fontSize: '0.95rem' }}>{getComposition(item.category).cond}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
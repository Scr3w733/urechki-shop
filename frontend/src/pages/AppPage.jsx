import { motion } from 'framer-motion';
import { QrCode, Smartphone, Star, CheckCircle, Apple, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AppPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ minHeight: '80vh', background: '#0a0a0a' }}>
      
      {/* HERO СЕКЦИЯ */}
      <section style={{ padding: '100px 5%', textAlign: 'center', background: 'linear-gradient(180deg, #111 0%, #0a0a0a 100%)' }}>
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(212,175,55,0.1)', border: '1px solid var(--accent)', padding: '8px 20px', borderRadius: '30px', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '20px' }}>
            🚀 Скоро в App Store и Google Play
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#fff', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px' }}>
            Весь магазин <br/><span style={{ color: 'var(--accent)' }}>в твоем кармане</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto 40px' }}>
            Заказывай пиво и закуски в один клик, получай эксклюзивные скидки и следи за статусом заказа в реальном времени.
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#000', color: '#fff', border: '1px solid #333', padding: '15px 30px', borderRadius: '15px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
              <Apple size={28} /> Скачать для iOS
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#000', color: '#fff', border: '1px solid #333', padding: '15px 30px', borderRadius: '15px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
              <Play size={28} /> Скачать для Android
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '15px' }}>
              <QrCode size={100} color="#000" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '5px' }}>Наведи камеру телефона</p>
              <p style={{ color: '#888' }}>чтобы скачать приложение прямо сейчас</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ПРЕИМУЩЕСТВА */}
      <section style={{ padding: '80px 5%', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
          {[
            { icon: <Smartphone size={40} color="var(--accent)" />, title: "Мгновенный заказ", desc: "Оформить заказ за 10 секунд, не вводя адрес каждый раз." },
            { icon: <Star size={40} color="var(--accent)" />, title: "Эксклюзивные скидки", desc: "Только в приложении доступны скрытые акции и промокоды." },
            { icon: <CheckCircle size={40} color="var(--accent)" />, title: "Push-уведомления", desc: "Узнавай о новых сортах пива первым." }
          ].map((item, i) => (
            <motion.div key={i} initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ color: '#aaa', fontSize: '0.95rem' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ОТЗЫВЫ О ПРИЛОЖЕНИИ */}
      <section style={{ padding: '40px 5% 80px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '40px' }}>Что говорят наши тестировщики?</h2>
        <div className="glass-panel" style={{ padding: '30px', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', color: 'var(--accent)', marginBottom: '15px' }}>
            <Star fill="var(--accent)" size={20}/><Star fill="var(--accent)" size={20}/><Star fill="var(--accent)" size={20}/><Star fill="var(--accent)" size={20}/><Star fill="var(--accent)" size={20}/>
          </div>
          <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '15px' }}>
            "Приложение просто пушка! Заказал пиво, пока ехал в лифте. Курьер приехал быстрее, чем я успел открыть банку чипсов. 10 из 10!"
          </p>
          <strong style={{ color: '#fff' }}>— Владимир, бета-тестер</strong>
        </div>
      </section>

    </motion.div>
  );
}
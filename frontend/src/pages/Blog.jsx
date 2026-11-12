import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const articles = [
  { id: 1, title: "История сибирского пивоварения", desc: "Как Новосибирск стал столицей крафта за Уралом.", img: "🏭", date: "12 Ноября 2026", read: "5 мин" },
  { id: 2, title: "Как правильно дегустировать пиво", desc: "Гид для начинающих: температура, бокалы, аромат и вкус.", img: "🍺", date: "10 Ноября 2026", read: "7 мин" },
  { id: 3, title: "С чем сочетать разные сорта пива", desc: "Гастрономические пары: от классического леща к лагеру до шоколада к стауту.", img: "🍽️", date: "05 Ноября 2026", read: "10 мин" },
  { id: 4, title: "Наш путь к идеальному IPA", desc: "Сколько хмеля нужно для счастья? Рассказываем, как мы создавали 'Сибирское IPA'.", img: "🌿", date: "01 Ноября 2026", read: "4 мин" },
];

export default function Blog() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '80px 5%', minHeight: '80vh' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--accent)', textAlign: 'center', marginBottom: '20px' }}>Наш Блог</h1>
      <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '50px', fontSize: '1.1rem' }}>Читайте о пивной культуре, рецептах и жизни пивоварни</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {articles.map((article, i) => (
          <motion.div key={article.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ height: '200px', background: 'linear-gradient(135deg, #1a1a1a, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' }}>
              {article.img}
            </div>
            <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', gap: '15px', color: '#888', fontSize: '0.85rem', marginBottom: '15px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} /> {article.date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} /> {article.read}</span>
              </div>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '10px' }}>{article.title}</h2>
              <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>{article.desc}</p>
              <Link to={`/blog/${article.id}`} style={{ textDecoration: 'none' }}>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                  Читать статью <ChevronRight size={18} />
                </button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}